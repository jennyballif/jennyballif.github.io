(function (global) {
  const DEFAULT_CATEGORIES = ['Environment', 'Economy', 'Healthcare'];
  const DEFAULT_QUESTION = 'Should we adopt the current proposal?';
  const VOTE_OPTIONS = ['YES', 'NO', 'ABSTAIN'];

  function createInitialState(overrides = {}) {
    const categories = overrides.categories ? [...overrides.categories] : [...DEFAULT_CATEGORIES];
    const questionByCategory = {
      ...categories.reduce((acc, category) => {
        acc[category] = DEFAULT_QUESTION;
        return acc;
      }, {}),
      ...(overrides.questionByCategory ?? {}),
    };

    const state = {
      voters: [],
      proxies: {},
      votes: {},
      categories,
      activeCategory: categories[0] ?? null,
      questionByCategory,
      selectedPrincipal: null,
      selectedVoters: [],
      ...overrides,
    };

    if (!state.activeCategory || !state.categories.includes(state.activeCategory)) {
      state.activeCategory = state.categories[0] ?? null;
    }

    return state;
  }

  function getActiveVoteKey(category, question) {
    return `${category}|${question}`;
  }

  function getActiveVoteMap(state, category = state.activeCategory, question) {
    if (!category) {
      return {};
    }

    const resolvedQuestion =
      question ?? state.questionByCategory?.[category] ?? DEFAULT_QUESTION;
    const key = getActiveVoteKey(category, resolvedQuestion);
    state.votes[key] = state.votes[key] ?? {};
    return state.votes[key];
  }

  function upsertVote(state, { voterId, category, question, vote, timestamp = Date.now() }) {
    if (!voterId || !category) return;
    const voteMap = getActiveVoteMap(state, category, question);
    const normalizedVote = VOTE_OPTIONS.includes(vote) ? vote : null;
    const shouldDelete = normalizedVote === null || normalizedVote === 'ABSTAIN';
    if (shouldDelete) {
      delete voteMap[voterId];
    } else {
      voteMap[voterId] = { voterId, vote: normalizedVote, category, question, timestamp };
    }
  }

  function ensureProxyEntry(state, category, principalId) {
    if (!category || !principalId) {
      return [];
    }
    state.proxies[category] = state.proxies[category] ?? {};
    state.proxies[category][principalId] = state.proxies[category][principalId] ?? [];
    return state.proxies[category][principalId];
  }

  function getProxyChain(state, category, principalId, visited = new Set()) {
    if (!principalId) {
      return { chain: [], finalVote: 'ABSTAIN', cycle: false };
    }

    if (visited.has(principalId)) {
      return { chain: [principalId], finalVote: 'ABSTAIN', cycle: true };
    }

    const nextVisited = new Set(visited);
    nextVisited.add(principalId);

    const voteMap = getActiveVoteMap(state, category);
    const directVote = voteMap[principalId]?.vote;
    if (directVote && directVote !== 'ABSTAIN') {
      return { chain: [principalId], finalVote: directVote, cycle: false };
    }

    const proxies = state.proxies?.[category]?.[principalId] ?? [];
    let encounteredCycle = false;
    for (const proxyId of proxies) {
      const proxyVote = voteMap[proxyId]?.vote;
      if (proxyVote && proxyVote !== 'ABSTAIN') {
        return { chain: [principalId, proxyId], finalVote: proxyVote, cycle: false };
      }

      const result = getProxyChain(state, category, proxyId, nextVisited);
      if (result.cycle) {
        encounteredCycle = true;
        continue;
      }
      if (result.chain.length > 0 && result.finalVote && result.finalVote !== 'ABSTAIN') {
        return { chain: [principalId, ...result.chain], finalVote: result.finalVote, cycle: false };
      }
    }

    return { chain: [principalId], finalVote: 'ABSTAIN', cycle: encounteredCycle };
  }

  function cloneResolution(resolution) {
    return {
      chain: Array.isArray(resolution?.chain) ? [...resolution.chain] : [],
      finalVote: resolution?.finalVote ?? 'ABSTAIN',
      cycle: Boolean(resolution?.cycle),
    };
  }

  function resolveStableProxyChains(state, category) {
    const voters = state.voters ?? [];
    const stableMap = new Map();
    if (!category) {
      return stableMap;
    }

    const voteMap = getActiveVoteMap(state, category);
    const proxiesForCategory = state.proxies?.[category] ?? {};
    const cache = new Map();
    const stack = new Set();

    const resolveChain = (principalId) => {
      if (!principalId) {
        return { chain: [], finalVote: 'ABSTAIN', cycle: false };
      }
      if (cache.has(principalId)) {
        return cloneResolution(cache.get(principalId));
      }
      if (stack.has(principalId)) {
        return { chain: [principalId], finalVote: 'ABSTAIN', cycle: true };
      }

      stack.add(principalId);
      let resolution;
      const directVote = voteMap[principalId]?.vote;
      if (directVote && directVote !== 'ABSTAIN') {
        resolution = { chain: [principalId], finalVote: directVote, cycle: false };
      } else {
        const proxies = Array.isArray(proxiesForCategory[principalId])
          ? proxiesForCategory[principalId]
          : [];
        let encounteredCycle = false;
        for (const proxyId of proxies) {
          const proxyVote = voteMap[proxyId]?.vote;
          if (proxyVote && proxyVote !== 'ABSTAIN') {
            resolution = { chain: [principalId, proxyId], finalVote: proxyVote, cycle: false };
            break;
          }

          const result = resolveChain(proxyId);
          if (result.cycle) {
            encounteredCycle = true;
            continue;
          }
          if (
            result.chain.length > 0 &&
            result.finalVote &&
            result.finalVote !== 'ABSTAIN'
          ) {
            resolution = {
              chain: [principalId, ...result.chain],
              finalVote: result.finalVote,
              cycle: false,
            };
            break;
          }
        }

        if (!resolution) {
          resolution = { chain: [principalId], finalVote: 'ABSTAIN', cycle: encounteredCycle };
        }
      }

      stack.delete(principalId);
      cache.set(principalId, resolution);
      return cloneResolution(resolution);
    };

    for (const voter of voters) {
      const resolution = resolveChain(voter.id);
      stableMap.set(voter.id, resolution);
    }

    return stableMap;
  }

  function computeVoteResolution(state, category) {
    const results = new Map();
    const tallies = { YES: 0, NO: 0, ABSTAIN: 0 };
    if (!category) {
      return { results, tallies };
    }

    const question = state.questionByCategory?.[category] ?? DEFAULT_QUESTION;
    const voteMap = getActiveVoteMap(state, category, question);
    const proxiesForCategory = state.proxies?.[category] ?? {};
    const stableChains = resolveStableProxyChains(state, category);

    for (const voter of state.voters ?? []) {
      const resolution = stableChains.get(voter.id) ?? cloneResolution({ chain: [voter.id] });
      const finalVote = VOTE_OPTIONS.includes(resolution.finalVote)
        ? resolution.finalVote
        : 'ABSTAIN';
      const proxyList = Array.isArray(proxiesForCategory[voter.id])
        ? proxiesForCategory[voter.id]
        : [];
      const hasDelegation = proxyList.length > 0;
      const proxyRemovedVote = finalVote === 'ABSTAIN' && hasDelegation;
      const directVote = voteMap[voter.id]?.vote ?? null;
      const entry = {
        principalId: voter.id,
        chain: resolution.chain,
        finalVote,
        category,
        question,
        directVote,
        cycle: resolution.cycle,
        proxyRemovedVote,
      };
      results.set(voter.id, entry);
      tallies[finalVote] = (tallies[finalVote] ?? 0) + 1;
    }

    return { results, tallies };
  }

  function getColumns(state, category) {
    const voters = state.voters ?? [];
    if (!voters.length) {
      return { columns: [], columnMap: new Map(), rowPositions: new Map(), dependents: new Map() };
    }

    const voterById = new Map(voters.map((voter) => [voter.id, voter]));

    const { results } = computeVoteResolution(state, category);

    const columnMap = new Map();
    for (const voter of voters) {
      columnMap.set(voter.id, 0);
    }

    const dependents = new Map();
    for (const voter of voters) {
      dependents.set(voter.id, new Set());
    }

    for (const resolution of results.values()) {
      if (!resolution) {
        continue;
      }
      const chain = Array.isArray(resolution.chain) ? resolution.chain : [];
      if (!chain.length) {
        continue;
      }

      chain.forEach((voterId, index) => {
        if (!voterId) {
          return;
        }
        const current = columnMap.get(voterId) ?? 0;
        if (index > current) {
          columnMap.set(voterId, index);
        }
      });

      if (chain.length < 2 || resolution.cycle) {
        const actor = chain[0];
        if (actor) {
          const entry = dependents.get(actor) ?? new Set();
          entry.add(actor);
          dependents.set(actor, entry);
        }
        continue;
      }

      for (let index = 1; index < chain.length; index += 1) {
        const current = chain[index];
        const previous = chain[index - 1];
        if (!current || !previous) {
          continue;
        }
        const entry = dependents.get(current) ?? new Set();
        entry.add(previous);
        dependents.set(current, entry);
      }
    }

    let maxColumn = 0;
    for (const value of columnMap.values()) {
      maxColumn = Math.max(maxColumn, value);
    }

    const columns = Array.from({ length: maxColumn + 1 }, () => []);
    for (const voter of voters) {
      const column = columnMap.get(voter.id) ?? 0;
      columns[column].push(voter.id);
    }

    if (!columns.length) {
      return { columns: [], columnMap, rowPositions: new Map(), dependents };
    }

    const getActiveProxyId = (voterId) => {
      const resolution = results.get(voterId);
      const chain = Array.isArray(resolution?.chain) ? resolution.chain : [];
      if (!chain.length) {
        return voterId;
      }
      if (chain.length === 1) {
        return chain[0] ?? voterId;
      }
      return chain[chain.length - 1] ?? voterId;
    };

    const getName = (voterId) => voterById.get(voterId)?.name ?? voterId;

    const sortedColumns = columns.map((column) => [...column]);
    const rowPositions = new Map();
    let maxAssigned = -1;

    const leftColumn = sortedColumns[0] ?? [];
    const leftColumnSet = new Set(leftColumn);
    const getFinalVote = (voterId) => {
      const vote = results.get(voterId)?.finalVote;
      if (VOTE_OPTIONS.includes(vote)) {
        return vote;
      }
      return 'ABSTAIN';
    };

    const voteOrder = new Map([
      ['YES', 0],
      ['ABSTAIN', 1],
      ['NO', 2],
    ]);
    const activeProxyCounts = new Map();
    for (const resolution of results.values()) {
      const chain = Array.isArray(resolution?.chain) ? resolution.chain : [];
      if (chain.length < 2) {
        continue;
      }
      chain.slice(1).forEach((proxyId) => {
        const current = activeProxyCounts.get(proxyId) ?? 0;
        activeProxyCounts.set(proxyId, current + 1);
      });
    }

    const activeProxies = [];
    activeProxyCounts.forEach((count, proxyId) => {
      const columnIndex = columnMap.get(proxyId) ?? 0;
      if (columnIndex <= 0) {
        return;
      }
      const finalVote = getFinalVote(proxyId);
      activeProxies.push({
        id: proxyId,
        columnIndex,
        finalVote,
        count,
      });
    });

    activeProxies.sort((a, b) => {
      const orderA = voteOrder.get(a.finalVote) ?? voteOrder.get('ABSTAIN');
      const orderB = voteOrder.get(b.finalVote) ?? voteOrder.get('ABSTAIN');
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      if (a.columnIndex !== b.columnIndex) {
        return b.columnIndex - a.columnIndex;
      }
      if (a.count !== b.count) {
        return (b.count ?? 0) - (a.count ?? 0);
      }
      return getName(a.id).localeCompare(getName(b.id));
    });

    const proxyOrder = activeProxies.map((proxy) => proxy.id);
    const proxyIndex = new Map(proxyOrder.map((id, index) => [id, index]));

    const principalChains = new Map();
    const proxyToPrincipals = new Map();
    leftColumn.forEach((voterId) => {
      const chain = Array.isArray(results.get(voterId)?.chain) ? results.get(voterId).chain : [voterId];
      const proxies = chain.slice(1).filter((id) => !leftColumnSet.has(id));
      principalChains.set(voterId, proxies);
      proxies.forEach((proxyId) => {
        const list = proxyToPrincipals.get(proxyId) ?? [];
        list.push(voterId);
        proxyToPrincipals.set(proxyId, list);
      });
    });

    const proxyOrderLength = proxyOrder.length;
    const signatureCache = new Map();
    const getProxySignature = (voterId) => {
      if (signatureCache.has(voterId)) {
        return signatureCache.get(voterId);
      }
      const proxies = principalChains.get(voterId) ?? [];
      let signature = 0n;
      proxies.forEach((proxyId) => {
        const index = proxyIndex.get(proxyId);
        if (typeof index === 'number' && index >= 0 && proxyOrderLength > 0) {
          const shift = BigInt(proxyOrderLength - index - 1);
          signature |= 1n << shift;
        }
      });
      signatureCache.set(voterId, signature);
      return signature;
    };

    leftColumn.sort((a, b) => {
      const voteA = getFinalVote(a);
      const voteB = getFinalVote(b);
      const orderA = voteOrder.get(voteA) ?? voteOrder.get('ABSTAIN');
      const orderB = voteOrder.get(voteB) ?? voteOrder.get('ABSTAIN');
      if (orderA !== orderB) {
        return orderA - orderB;
      }

      const signatureA = getProxySignature(a);
      const signatureB = getProxySignature(b);
      if (signatureA !== signatureB) {
        return signatureA > signatureB ? -1 : 1;
      }

      const proxyA = getActiveProxyId(a);
      const proxyB = getActiveProxyId(b);
      if (proxyA !== proxyB) {
        return proxyA.localeCompare(proxyB);
      }

      const nameCompare = getName(a).localeCompare(getName(b));
      if (nameCompare !== 0) {
        return nameCompare;
      }
      return a.localeCompare(b);
    });

    leftColumn.forEach((voterId, index) => {
      rowPositions.set(voterId, index);
      if (index > maxAssigned) {
        maxAssigned = index;
      }
    });

    const proxyAverages = new Map();
    proxyOrder.forEach((proxyId) => {
      const principals = proxyToPrincipals.get(proxyId) ?? [];
      const positions = principals
        .map((principalId) => rowPositions.get(principalId))
        .filter((value) => typeof value === 'number' && Number.isFinite(value));
      if (!positions.length) {
        return;
      }
      const sum = positions.reduce((acc, value) => acc + value, 0);
      const average = sum / positions.length;
      proxyAverages.set(proxyId, average);
      if (average > maxAssigned) {
        maxAssigned = average;
      }
    });

    for (let columnIndex = 1; columnIndex < sortedColumns.length; columnIndex += 1) {
      const column = sortedColumns[columnIndex];
      if (!column.length) {
        continue;
      }

      column.sort((a, b) => {
        const orderA = proxyIndex.has(a) ? proxyIndex.get(a) : Number.POSITIVE_INFINITY;
        const orderB = proxyIndex.has(b) ? proxyIndex.get(b) : Number.POSITIVE_INFINITY;
        if (orderA !== orderB) {
          return orderA - orderB;
        }

        const voteA = getFinalVote(a);
        const voteB = getFinalVote(b);
        const priorityA = voteOrder.get(voteA) ?? voteOrder.get('ABSTAIN');
        const priorityB = voteOrder.get(voteB) ?? voteOrder.get('ABSTAIN');
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        const nameCompare = getName(a).localeCompare(getName(b));
        if (nameCompare !== 0) {
          return nameCompare;
        }
        return a.localeCompare(b);
      });

      column.forEach((voterId, index) => {
        if (rowPositions.has(voterId)) {
          return;
        }
        const average = proxyAverages.get(voterId);
        if (typeof average === 'number' && Number.isFinite(average)) {
          rowPositions.set(voterId, average);
          if (average > maxAssigned) {
            maxAssigned = average;
          }
        } else {
          const position = maxAssigned + 1 + index;
          rowPositions.set(voterId, position);
          if (position > maxAssigned) {
            maxAssigned = position;
          }
        }
      });
    }

    const filteredColumns = sortedColumns.filter((column) => column.length > 0);

    return {
      columns: filteredColumns,
      columnMap,
      rowPositions,
      dependents,
    };
  }

  const LiquidLogic = {
    DEFAULT_CATEGORIES,
    DEFAULT_QUESTION,
    VOTE_OPTIONS,
    createInitialState,
    getActiveVoteKey,
    getActiveVoteMap,
    upsertVote,
    ensureProxyEntry,
    getProxyChain,
    computeVoteResolution,
    getColumns,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiquidLogic;
  } else {
    global.LiquidLogic = LiquidLogic;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
