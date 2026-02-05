const logic = require('./logic.js');

describe('LiquidLogic vote resolution', () => {
  function buildState(voterIds) {
    const state = logic.createInitialState();
    state.voters = voterIds.map((id) => ({ id, name: id, isProxy: true }));
    return state;
  }

  test('direct votes override proxy delegations', () => {
    const state = buildState(['alice', 'proxy']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'alice').push('proxy');
    logic.upsertVote(state, { voterId: 'proxy', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'alice', category, question, vote: 'NO' });

    const resolution = logic.computeVoteResolution(state, category);
    const aliceResult = resolution.results.get('alice');

    expect(aliceResult.finalVote).toBe('NO');
    expect(aliceResult.directVote).toBe('NO');
    expect(aliceResult.chain).toEqual(['alice']);
    expect(resolution.tallies.NO).toBe(1);
  });

  test('delegations follow multi-hop proxy chains', () => {
    const state = buildState(['a', 'b', 'c']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'a').push('b');
    logic.ensureProxyEntry(state, category, 'b').push('c');
    logic.upsertVote(state, { voterId: 'c', category, question, vote: 'YES' });

    const resolution = logic.computeVoteResolution(state, category);
    const aResult = resolution.results.get('a');

    expect(aResult.finalVote).toBe('YES');
    expect(aResult.chain).toEqual(['a', 'b', 'c']);
    expect(resolution.tallies.YES).toBe(3);
  });

  test('abstain votes clear direct entries and allow fallback proxies', () => {
    const state = buildState(['principal', 'proxyOne', 'proxyTwo']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    const chain = logic.ensureProxyEntry(state, category, 'principal');
    chain.push('proxyOne');
    chain.push('proxyTwo');

    logic.upsertVote(state, { voterId: 'proxyOne', category, question, vote: 'ABSTAIN' });

    const voteMap = logic.getActiveVoteMap(state, category, question);
    expect(voteMap.proxyOne).toBe(undefined);

    logic.upsertVote(state, { voterId: 'proxyTwo', category, question, vote: 'YES' });

    const resolution = logic.computeVoteResolution(state, category);
    const principalResult = resolution.results.get('principal');

    expect(principalResult.finalVote).toBe('YES');
    expect(principalResult.chain).toEqual(['principal', 'proxyTwo']);
  });

  test('cycles are detected and default to abstain', () => {
    const state = buildState(['x', 'y']);
    const category = state.activeCategory;

    logic.ensureProxyEntry(state, category, 'x').push('y');
    logic.ensureProxyEntry(state, category, 'y').push('x');

    const resolution = logic.computeVoteResolution(state, category);
    const xResult = resolution.results.get('x');
    const yResult = resolution.results.get('y');

    expect(xResult.finalVote).toBe('ABSTAIN');
    expect(yResult.finalVote).toBe('ABSTAIN');
    expect(xResult.cycle).toBe(true);
    expect(yResult.cycle).toBe(true);
    expect(xResult.proxyRemovedVote).toBe(true);
    expect(yResult.proxyRemovedVote).toBe(true);
    expect(resolution.tallies.ABSTAIN).toBe(2);
  });

  test('delegated abstentions still contribute to abstain tallies', () => {
    const state = buildState(['principal', 'proxy']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'principal').push('proxy');
    logic.upsertVote(state, { voterId: 'proxy', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'proxy', category, question, vote: 'ABSTAIN' });

    const resolution = logic.computeVoteResolution(state, category);
    const principalResult = resolution.results.get('principal');

    expect(principalResult.finalVote).toBe('ABSTAIN');
    expect(principalResult.proxyRemovedVote).toBe(true);
    expect(resolution.tallies.ABSTAIN).toBe(2);
  });

  test('non-delegated voters still count as abstain when idle', () => {
    const state = buildState(['solo']);
    const category = state.activeCategory;

    const resolution = logic.computeVoteResolution(state, category);
    const soloResult = resolution.results.get('solo');

    expect(soloResult.finalVote).toBe('ABSTAIN');
    expect(soloResult.proxyRemovedVote).toBe(false);
    expect(resolution.tallies.ABSTAIN).toBe(1);
  });

  test('columns keep every voter on the left when no delegations exist', () => {
    const state = buildState(['root', 'mid', 'leaf']);
    const category = state.activeCategory;

    const { columns } = logic.getColumns(state, category);

    expect(columns.length).toBe(1);
    expect(columns[0].length).toBe(3);
    expect(columns[0]).toContain('root');
    expect(columns[0]).toContain('mid');
    expect(columns[0]).toContain('leaf');
  });

  test('unresolved delegations still position proxies to the right', () => {
    const state = buildState(['principal', 'proxy']);
    const category = state.activeCategory;

    logic.ensureProxyEntry(state, category, 'principal').push('proxy');

    const layout = logic.getColumns(state, category);

    expect(layout.columns.length >= 2).toBe(true);
    expect(layout.columns[0]).toContain('principal');
    expect(layout.columns[1]).toContain('proxy');
    expect(layout.rowPositions.get('proxy')).toBe(layout.rowPositions.get('principal'));
  });

  test('cyclic delegations remain anchored in the principal column', () => {
    const voters = ['A', 'C', 'D', 'F', 'G', 'H', 'I', 'J'];
    const state = buildState(voters);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    const delegate = (principal, proxy) =>
      logic.ensureProxyEntry(state, category, principal).push(proxy);

    delegate('A', 'C');
    delegate('C', 'A');
    delegate('D', 'G');
    delegate('D', 'F');
    delegate('F', 'G');
    delegate('F', 'J');
    delegate('G', 'J');
    delegate('G', 'F');
    delegate('H', 'J');
    delegate('I', 'F');
    delegate('I', 'G');

    logic.upsertVote(state, { voterId: 'G', category, question, vote: 'YES' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[0]).toContain('A');
    expect(columns[0]).toContain('C');
    columns.slice(1).forEach((column) => {
      expect(column.includes('A')).toBe(false);
      expect(column.includes('C')).toBe(false);
    });
  });

  test('direct vote proxies float to the right of their principals', () => {
    const state = buildState(['root', 'mid', 'leaf']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'root').push('mid');
    logic.ensureProxyEntry(state, category, 'mid').push('leaf');
    logic.upsertVote(state, { voterId: 'leaf', category, question, vote: 'YES' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[0]).toContain('root');
    expect(columns[1]).toContain('mid');
    expect(columns[2]).toContain('leaf');
  });

  test('left column sorts by the active proxy chain', () => {
    const state = buildState(['p1', 'p2', 'mid', 'proxyA', 'proxyB']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'p1').push('mid');
    logic.ensureProxyEntry(state, category, 'mid').push('proxyB');
    logic.ensureProxyEntry(state, category, 'p2').push('proxyA');

    logic.upsertVote(state, { voterId: 'proxyA', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'proxyB', category, question, vote: 'NO' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[0]).toEqual(['p2', 'p1']);
  });

  test('left column groups voters by final vote before proxy grouping', () => {
    const state = buildState([
      'yesPrincipal',
      'yesProxy',
      'abstainPrincipal',
      'noPrincipal',
      'noProxy',
    ]);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'yesPrincipal').push('yesProxy');
    logic.ensureProxyEntry(state, category, 'noPrincipal').push('noProxy');

    logic.upsertVote(state, { voterId: 'yesProxy', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'noProxy', category, question, vote: 'NO' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[0]).toEqual(['yesPrincipal', 'abstainPrincipal', 'noPrincipal']);
  });

  test('proxy chains remain synchronized across voters after cascading updates', () => {
    const state = buildState(['a', 'b', 'c', 'd', 'e']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'a').push('b');
    logic.ensureProxyEntry(state, category, 'b').push('c');
    logic.ensureProxyEntry(state, category, 'c').push('d');
    logic.ensureProxyEntry(state, category, 'e').push('b');

    logic.upsertVote(state, { voterId: 'd', category, question, vote: 'YES' });

    let resolution = logic.computeVoteResolution(state, category);
    expect(resolution.results.get('a').chain).toEqual(['a', 'b', 'c', 'd']);
    expect(resolution.results.get('b').chain).toEqual(['b', 'c', 'd']);
    expect(resolution.results.get('c').chain).toEqual(['c', 'd']);
    expect(resolution.results.get('e').chain).toEqual(['e', 'b', 'c', 'd']);

    logic.upsertVote(state, { voterId: 'd', category, question, vote: 'ABSTAIN' });
    logic.upsertVote(state, { voterId: 'c', category, question, vote: 'NO' });

    resolution = logic.computeVoteResolution(state, category);
    expect(resolution.results.get('a').chain).toEqual(['a', 'b', 'c']);
    expect(resolution.results.get('b').chain).toEqual(['b', 'c']);
    expect(resolution.results.get('c').chain).toEqual(['c']);
    expect(resolution.results.get('e').chain).toEqual(['e', 'b', 'c']);
    expect(resolution.results.get('a').finalVote).toBe('NO');
    expect(resolution.results.get('b').finalVote).toBe('NO');
    expect(resolution.results.get('e').finalVote).toBe('NO');
  });

  test('shared proxies reuse a single consistent delegation chain', () => {
    const voters = ['v0', 'v1', 'v2', 'v3', 'v4'];
    const state = buildState(voters);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'v0').push('v3');
    const v1Chain = logic.ensureProxyEntry(state, category, 'v1');
    v1Chain.push('v2');
    v1Chain.push('v3');
    logic.ensureProxyEntry(state, category, 'v2').push('v4');
    const v3Chain = logic.ensureProxyEntry(state, category, 'v3');
    v3Chain.push('v1');
    v3Chain.push('v2');
    const v4Chain = logic.ensureProxyEntry(state, category, 'v4');
    v4Chain.push('v1');
    v4Chain.push('v3');

    logic.upsertVote(state, { voterId: 'v3', category, question, vote: 'YES' });

    const { results } = logic.computeVoteResolution(state, category);
    expect(results.get('v4').chain).toEqual(['v4', 'v3']);
    expect(results.get('v2').chain).toEqual(['v2', 'v4', 'v3']);
    expect(results.get('v1').chain).toEqual(['v1', 'v2', 'v4', 'v3']);

    expect(results.get('v1').chain.slice(1)).toEqual(results.get('v2').chain);
    expect(results.get('v2').chain.slice(1)).toEqual(results.get('v4').chain);
  });

  test('proxy columns are ordered by the averaged position of their chains', () => {
    const state = buildState(['p1', 'p2', 'p3', 'proxyA', 'proxyB']);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    logic.ensureProxyEntry(state, category, 'p1').push('proxyA');
    logic.ensureProxyEntry(state, category, 'p2').push('proxyB');
    logic.ensureProxyEntry(state, category, 'p3').push('proxyB');

    logic.upsertVote(state, { voterId: 'proxyA', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'proxyB', category, question, vote: 'NO' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[0]).toEqual(['p1', 'p2', 'p3']);
    expect(columns[1]).toEqual(['proxyA', 'proxyB']);
  });

  test('proxy column sorting follows computed row positions', () => {
    const voters = ['A', 'C', 'D', 'F', 'G', 'H', 'I', 'J'];
    const state = buildState(voters);
    const category = state.activeCategory;
    const question = state.questionByCategory[category];

    const delegate = (principal, proxy) =>
      logic.ensureProxyEntry(state, category, principal).push(proxy);

    delegate('A', 'C');
    delegate('C', 'A');
    delegate('D', 'G');
    delegate('D', 'F');
    delegate('F', 'G');
    delegate('F', 'J');
    delegate('G', 'J');
    delegate('G', 'F');
    delegate('H', 'J');
    delegate('I', 'F');
    delegate('I', 'G');

    logic.upsertVote(state, { voterId: 'G', category, question, vote: 'YES' });
    logic.upsertVote(state, { voterId: 'A', category, question, vote: 'YES' });

    const { columns } = logic.getColumns(state, category);

    expect(columns[1]).toEqual(['F', 'A', 'J']);
  });
});
