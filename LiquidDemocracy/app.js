const STORAGE_KEY = 'liquid-democracy-state-v1';

const logic =
  typeof LiquidLogic !== 'undefined'
    ? LiquidLogic
    : typeof require === 'function'
    ? require('./logic.js')
    : null;

if (!logic) {
  throw new Error('LiquidLogic module not loaded');
}

const {
  DEFAULT_CATEGORIES,
  DEFAULT_QUESTION,
  VOTE_OPTIONS,
  createInitialState,
  upsertVote,
  getActiveVoteMap,
  ensureProxyEntry,
  computeVoteResolution,
  getColumns,
} = logic;

const doc = typeof document !== 'undefined' ? document : null;
const scheduleFrame =
  typeof requestAnimationFrame === 'function'
    ? (cb) => requestAnimationFrame(cb)
    : (cb) => setTimeout(cb, 16);
const cancelFrame =
  typeof cancelAnimationFrame === 'function'
    ? (handle) => cancelAnimationFrame(handle)
    : (handle) => clearTimeout(handle);
let pendingCanvasLayout = null;
let latestCanvasLayout = null;
let canvasResizeObserver = null;
const observedCanvasCards = new Set();
let pendingArrowTimeout = null;
let pendingArrowFrame = null;
let pendingArrowResults = null;

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => {
    queueCanvasLayout();
  });
}

const state = initializeState();

const templates = {
  voter: doc?.getElementById('voter-list-item') ?? null,
  proxyOrder: doc?.getElementById('proxy-order-item') ?? null,
  simpleItem: doc?.getElementById('simple-list-item') ?? null,
  canvasCard: doc?.getElementById('canvas-card') ?? null,
  tally: doc?.getElementById('tally-item') ?? null,
};

const elements = {
  tabButtons: doc ? Array.from(doc.querySelectorAll('.tab-button')) : [],
  tabPanels: doc ? Array.from(doc.querySelectorAll('.tab-panel')) : [],
  registrationForm: doc?.getElementById('registration-form') ?? null,
  voterList: doc?.getElementById('voter-list') ?? null,
  addSampleData: doc?.getElementById('add-sample-data') ?? null,
  categorySelect: doc?.getElementById('category-select') ?? null,
  categoryForm: doc?.getElementById('category-form') ?? null,
  newCategoryInput: doc?.getElementById('new-category') ?? null,
  principalList: doc?.getElementById('principal-list') ?? null,
  proxyOrder: doc?.getElementById('proxy-order') ?? null,
  proxyCandidates: doc?.getElementById('proxy-candidates') ?? null,
  voteCategory: doc?.getElementById('vote-category') ?? null,
  voteQuestion: doc?.getElementById('vote-question') ?? null,
  setQuestion: doc?.getElementById('set-question') ?? null,
  clearAllVotes: doc?.getElementById('clear-all-votes') ?? null,
  canvas: doc?.getElementById('canvas') ?? null,
  canvasWrapper: doc?.querySelector('.canvas-wrapper') ?? null,
  canvasArrows: doc?.getElementById('canvas-arrows') ?? null,
  voteTally: doc?.getElementById('vote-tally') ?? null,
};

function initializeState() {
  const baseState = createInitialState();
  const saved = loadState();
  if (!saved) {
    return baseState;
  }

  const categories = Array.isArray(saved.categories) && saved.categories.length
    ? [...saved.categories]
    : [...baseState.categories];

  const questionByCategory = {
    ...baseState.questionByCategory,
    ...(typeof saved.questionByCategory === 'object' && saved.questionByCategory !== null
      ? saved.questionByCategory
      : {}),
  };

  const activeCategory = categories.includes(saved.activeCategory)
    ? saved.activeCategory
    : categories[0] ?? null;

  return {
    ...baseState,
    ...saved,
    categories,
    questionByCategory,
    activeCategory,
    voters: Array.isArray(saved.voters) ? saved.voters : [],
    proxies: typeof saved.proxies === 'object' && saved.proxies !== null ? saved.proxies : {},
    votes: typeof saved.votes === 'object' && saved.votes !== null ? saved.votes : {},
    selectedVoters: Array.isArray(saved.selectedVoters) ? saved.selectedVoters : [],
    selectedPrincipal: saved.selectedPrincipal ?? null,
  };
}

function saveState() {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    const payload = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, payload);
  } catch (error) {
    console.warn('Failed to persist state', error);
  }
}

function loadState() {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Failed to parse saved state', error);
    return null;
  }
}

function generateId(prefix = 'voter') {
  const cryptoObj =
    typeof crypto !== 'undefined'
      ? crypto
      : typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : null;
  if (cryptoObj?.randomUUID) {
    return `${prefix}-${cryptoObj.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
}

function renderRegistration() {
  elements.voterList.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (const voter of state.voters) {
    const node = templates.voter.content.firstElementChild.cloneNode(true);
    node.querySelector('.name').textContent = voter.name;
    const toggle = node.querySelector('.proxy-toggle');
    toggle.checked = voter.isProxy;
    toggle.addEventListener('change', () => {
      voter.isProxy = toggle.checked;
      saveState();
      renderProxySetup();
    });
    node.querySelector('.remove').addEventListener('click', () => {
      removeVoter(voter.id);
    });
    fragment.appendChild(node);
  }

  elements.voterList.appendChild(fragment);
}

function removeVoter(voterId) {
  state.voters = state.voters.filter((v) => v.id !== voterId);
  for (const category of Object.keys(state.proxies)) {
    delete state.proxies[category][voterId];
    for (const [principalId, proxyList] of Object.entries(state.proxies[category])) {
      state.proxies[category][principalId] = proxyList.filter((id) => id !== voterId);
    }
  }

  for (const key of Object.keys(state.votes)) {
    delete state.votes[key][voterId];
  }

  if (state.selectedPrincipal === voterId) {
    state.selectedPrincipal = null;
  }

  state.selectedVoters = state.selectedVoters.filter((id) => id !== voterId);
  saveState();
  renderAll();
}

function renderCategoryOptions() {
  const categories = state.categories;
  if (!categories.includes(state.activeCategory)) {
    state.activeCategory = categories[0] ?? null;
  }
  const categorySelects = [elements.categorySelect, elements.voteCategory];
  for (const select of categorySelects) {
    select.innerHTML = '';
    for (const category of categories) {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      if (category === state.activeCategory) {
        option.selected = true;
      }
      select.appendChild(option);
    }
  }

  elements.voteQuestion.value = state.questionByCategory[state.activeCategory] ?? DEFAULT_QUESTION;
}

function renderPrincipalList() {
  if (state.voters.length === 0) {
    state.selectedPrincipal = null;
  } else if (!state.voters.some((v) => v.id === state.selectedPrincipal)) {
    state.selectedPrincipal = state.voters[0].id;
  }
  elements.principalList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const voter of state.voters) {
    const li = templates.simpleItem.content.firstElementChild.cloneNode(true);
    const button = li.querySelector('button');
    button.textContent = voter.name;
    button.classList.toggle('active', voter.id === state.selectedPrincipal);
    button.disabled = state.voters.length === 0;
    button.addEventListener('click', () => {
      state.selectedPrincipal = voter.id;
      renderProxySetup();
    });
    fragment.appendChild(li);
  }
  elements.principalList.appendChild(fragment);
}

function renderProxyOrder() {
  elements.proxyOrder.innerHTML = '';
  const principalId = state.selectedPrincipal;
  if (!principalId) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Select a principal to manage their proxies.';
    elements.proxyOrder.appendChild(empty);
    return;
  }

  const proxies = ensureProxyEntry(state, state.activeCategory, principalId);
  const fragment = document.createDocumentFragment();
  proxies.forEach((proxyId, index) => {
    const voter = state.voters.find((v) => v.id === proxyId);
    if (!voter) return;
    const node = templates.proxyOrder.content.firstElementChild.cloneNode(true);
    node.querySelector('.name').textContent = voter.name;
    node.querySelector('.label').textContent = `Priority ${index + 1}`;
    node.querySelector('.move-up').addEventListener('click', () => {
      if (index === 0) return;
      [proxies[index - 1], proxies[index]] = [proxies[index], proxies[index - 1]];
      saveState();
      renderProxySetup();
    });
    node.querySelector('.move-down').addEventListener('click', () => {
      if (index === proxies.length - 1) return;
      [proxies[index + 1], proxies[index]] = [proxies[index], proxies[index + 1]];
      saveState();
      renderProxySetup();
    });
    node.querySelector('.remove').addEventListener('click', () => {
      proxies.splice(index, 1);
      saveState();
      renderProxySetup();
    });
    fragment.appendChild(node);
  });

  if (!fragment.childElementCount) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No proxies assigned yet.';
    elements.proxyOrder.appendChild(empty);
  } else {
    elements.proxyOrder.appendChild(fragment);
  }
}

function renderProxyCandidates() {
  elements.proxyCandidates.innerHTML = '';
  const principalId = state.selectedPrincipal;
  const proxies = principalId ? ensureProxyEntry(state, state.activeCategory, principalId) : [];
  const assigned = new Set(proxies);
  const fragment = document.createDocumentFragment();

  const availableVoters = state.voters.filter(
    (v) => v.isProxy && v.id !== principalId && !assigned.has(v.id)
  );

  for (const voter of availableVoters) {
    const li = templates.simpleItem.content.firstElementChild.cloneNode(true);
    const button = li.querySelector('button');
    button.textContent = voter.name;
    button.addEventListener('click', () => {
      if (!principalId) return;
      proxies.push(voter.id);
      saveState();
      renderProxySetup();
    });
    fragment.appendChild(li);
  }

  if (!principalId) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Choose a principal to assign proxies.';
    elements.proxyCandidates.appendChild(empty);
  } else if (!fragment.childElementCount) {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'No available proxies. Enable proxy permission in the registration tab.';
    elements.proxyCandidates.appendChild(empty);
  } else {
    elements.proxyCandidates.appendChild(fragment);
  }
}

function renderProxySetup() {
  renderCategoryOptions();
  renderPrincipalList();
  renderProxyOrder();
  renderProxyCandidates();
  renderVotingTab();
}

function renderTally(tallies) {
  elements.voteTally.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const displayOrder = ['YES', 'ABSTAIN', 'NO'].filter((vote) => VOTE_OPTIONS.includes(vote));
  displayOrder.forEach((vote) => {
    const node = templates.tally.content.firstElementChild.cloneNode(true);
    node.dataset.vote = vote;
    node.querySelector('.label').textContent = vote;
    node.querySelector('.count').textContent = tallies[vote] ?? 0;
    fragment.appendChild(node);
  });
  elements.voteTally.appendChild(fragment);
}

function renderCanvas(category, resolution) {
  const { results, tallies } = resolution;
  const columnLayout = getColumns(state, category) ?? {};
  const columns = Array.isArray(columnLayout.columns) ? columnLayout.columns : [];
  const dependents = columnLayout.dependents instanceof Map ? columnLayout.dependents : new Map();
  const rowPositions =
    columnLayout.rowPositions instanceof Map ? columnLayout.rowPositions : new Map();
  elements.canvas.innerHTML = '';
  elements.canvasArrows.innerHTML = '';

  const columnElements = [];

  columns.forEach((column, columnIndex) => {
    const columnEl = document.createElement('div');
    columnEl.className = 'canvas-column';
    columnEl.dataset.columnIndex = String(columnIndex);
    column.forEach((voterId) => {
      const voter = state.voters.find((v) => v.id === voterId);
      if (!voter) return;
      const node = templates.canvasCard.content.firstElementChild.cloneNode(true);
      node.dataset.id = voter.id;
      const resolution = results.get(voter.id);
      node.dataset.vote = resolution?.finalVote ?? 'ABSTAIN';
      node.querySelector('.name').textContent = voter.name;
      const badge = node.querySelector('.badge');
      badge.textContent = resolution?.directVote ? 'Direct vote' : voter.isProxy ? 'Proxy' : 'Principal';
      const meta = node.querySelector('.meta');
      const metaLines = meta?.querySelector('.meta-lines') ?? null;
      const voteContainer = meta?.querySelector('.card-vote-pills') ?? null;
      const voteControls = Array.from(voteContainer?.querySelectorAll('.vote-pill')) ?? [];
      const proxiesForPrincipal = Array.isArray(state.proxies?.[category]?.[voter.id])
        ? state.proxies[category][voter.id]
        : [];
      if (metaLines) {
        metaLines.innerHTML = '';
      }

      const lines = [];
      if (resolution?.proxyRemovedVote) {
        if (proxiesForPrincipal.length) {
          const proxyNames = proxiesForPrincipal
            .map((id) => state.voters.find((v) => v.id === id)?.name ?? 'Unknown')
            .filter(Boolean)
            .join(' → ');
          if (proxyNames) {
            lines.push(`Proxy order: ${proxyNames}`);
          }
        }
      } else if (resolution?.directVote) {
        lines.push(`Voted: ${resolution.directVote}`);
      } else if (resolution?.chain.length > 1) {
        const chainNames = resolution.chain
          .slice(1)
          .map((id) => state.voters.find((v) => v.id === id)?.name ?? 'Unknown')
          .join(' → ');
        lines.push(`Delegated to: ${chainNames}`);
      }
      if (metaLines) {
        lines.forEach((line, index) => {
          const span = document.createElement('span');
          span.className = 'meta-line';
          if (index === 0) {
            span.classList.add('meta-line--full');
          }
          span.textContent = line;
          metaLines.appendChild(span);
        });
      }
      meta.classList.toggle('is-empty', lines.length === 0);
      node.classList.toggle('selected', state.selectedVoters.includes(voter.id));
      node.addEventListener('click', (event) => {
        if (event.target.closest('.vote-pill')) {
          return;
        }
        if (event.shiftKey) {
          toggleSelection(voter.id);
        } else if (event.metaKey || event.ctrlKey) {
          toggleSelection(voter.id);
        } else {
          selectSingle(voter.id);
        }
      });
      const directVote = resolution?.directVote ?? null;
      node.querySelectorAll('.vote-pill[data-vote]').forEach((button) => {
        const vote = button.dataset.vote;
        if (!VOTE_OPTIONS.includes(vote)) {
          return;
        }
        const isCast = directVote === vote;
        button.classList.toggle('cast', isCast);
        button.setAttribute('aria-pressed', String(isCast));
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          handleCardVote(voter.id, vote);
        });
      });
      columnEl.appendChild(node);
    });
    elements.canvas.appendChild(columnEl);
    columnElements.push(columnEl);
  });

  const tallyColumn = document.createElement('div');
  tallyColumn.className = 'canvas-column tally-column';
  const tallyOrder = ['YES', 'ABSTAIN', 'NO'].filter((vote) => VOTE_OPTIONS.includes(vote));
  tallyOrder.forEach((vote) => {
    const card = document.createElement('div');
    card.className = 'tally-card';
    card.dataset.id = `${vote}-tally`;
    card.dataset.vote = vote;
    card.tabIndex = -1;

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.textContent = vote;
    const badge = document.createElement('span');
    badge.className = 'badge';
    const count = tallies[vote] ?? 0;
    badge.textContent = `${count} vote${count === 1 ? '' : 's'}`;
    header.appendChild(title);
    header.appendChild(badge);

    card.appendChild(header);
    tallyColumn.appendChild(card);
  });
  elements.canvas.appendChild(tallyColumn);

  latestCanvasLayout = {
    columnElements,
    columns,
    dependents,
    rowPositions,
    tallyColumn,
    tallies,
    results,
  };

  resetCanvasResizeObserver();
  queueCanvasLayout();
}

function queueCanvasLayout() {
  if (!latestCanvasLayout) {
    return;
  }

  if (pendingCanvasLayout) {
    cancelFrame(pendingCanvasLayout);
    pendingCanvasLayout = null;
  }

  pendingCanvasLayout = scheduleFrame(() => {
    pendingCanvasLayout = null;
    performCanvasLayout();
  });
}

function performCanvasLayout() {
  if (!latestCanvasLayout) {
    return;
  }

  const { columnElements, columns, dependents, rowPositions, tallyColumn, tallies, results } =
    latestCanvasLayout;

  applyColumnLayout(columnElements, columns, dependents, rowPositions);
  adjustTallyHeights(tallyColumn, tallies, columnElements[0]);
  queueArrowRender(results);
}

function resetCanvasResizeObserver() {
  if (!elements.canvas) {
    return;
  }

  if (typeof ResizeObserver === 'undefined') {
    return;
  }

  if (!canvasResizeObserver) {
    canvasResizeObserver = new ResizeObserver((entries) => {
      let requiresLayout = false;
      entries.forEach((entry) => {
        const currentHeight = Math.ceil(entry.contentRect?.height ?? 0);
        const previousHeight = Number(entry.target.dataset.observedHeight);
        if (!Number.isFinite(previousHeight) || Math.abs(previousHeight - currentHeight) > 0.5) {
          entry.target.dataset.observedHeight = String(currentHeight);
          requiresLayout = true;
        }
      });
      if (requiresLayout) {
        queueCanvasLayout();
      }
    });
  }

  observedCanvasCards.forEach((card) => {
    canvasResizeObserver.unobserve(card);
  });
  observedCanvasCards.clear();

  const cards = elements.canvas.querySelectorAll('.canvas-card');
  cards.forEach((card) => {
    canvasResizeObserver.observe(card);
    observedCanvasCards.add(card);
    const rect = card.getBoundingClientRect();
    const measured = Math.ceil(rect.height || card.scrollHeight || 0);
    card.dataset.observedHeight = String(measured);
  });
}

function applyColumnLayout(columnElements, columnData, dependents, rowPositions = new Map()) {
  if (!elements.canvasWrapper) {
    return new Map();
  }

  const verticalGap = 18;
  const wrapperRect = elements.canvasWrapper.getBoundingClientRect();
  const centers = new Map();
  const anchorEntries = [];
  const cardPositions = new Map();
  let hasSortedAnchors = false;

  columnElements.forEach((columnEl, columnIndex) => {
    if (!columnEl) {
      return;
    }
    columnEl.style.position = 'relative';
    const ids = columnData[columnIndex] ?? [];
    if (!ids.length) {
      columnEl.style.minHeight = '0px';
      return;
    }

    const columnRect = columnEl.getBoundingClientRect();
    const columnOffset = columnRect.top - wrapperRect.top;
    const columnLeft = columnRect.left - wrapperRect.left;
    const columnRight = columnRect.right - wrapperRect.left;
    let columnHeight = 0;
    const placements = [];

    ids.forEach((voterId, index) => {
      const card = columnEl.querySelector(`[data-id="${voterId}"]`);
      if (!card) {
        return;
      }

      const rect = card.getBoundingClientRect();
      card.style.position = 'absolute';
      card.style.left = '0';
      card.style.right = '0';
      card.style.margin = '0';

      let top;
      const previousPlacement = placements[placements.length - 1];
      const minSequentialTop = previousPlacement ? previousPlacement.bottom + verticalGap : 0;
      if (columnIndex === 0) {
        top = minSequentialTop;
      } else {
        if (!hasSortedAnchors && anchorEntries.length && columnIndex > 0) {
          anchorEntries.sort((a, b) => a.value - b.value);
          hasSortedAnchors = true;
        }

        const dependentIds = dependents.get(voterId) ?? new Set();
        const dependentCenters = Array.from(dependentIds)
          .map((id) => centers.get(id))
          .filter((value) => typeof value === 'number' && Number.isFinite(value));

        const rowValue = Number(rowPositions?.get?.(voterId));
        const anchorCenter = getAnchorCenter(anchorEntries, rowValue);

        if (Number.isFinite(anchorCenter)) {
          top = anchorCenter - columnOffset - rect.height / 2;
        } else if (dependentCenters.length) {
          const average =
            dependentCenters.reduce((acc, value) => acc + value, 0) / dependentCenters.length;
          top = average - columnOffset - rect.height / 2;
        } else {
          top = minSequentialTop;
        }

        if (!Number.isFinite(top)) {
          top = minSequentialTop;
        }

        if (top < 0) {
          top = 0;
        }

        const sequentialTop = previousPlacement ? previousPlacement.bottom + verticalGap : 0;
        if (top < sequentialTop) {
          top = sequentialTop;
        }
      }

      const bottom = top + rect.height;
      const absoluteCenter = columnOffset + top + rect.height / 2;
      centers.set(voterId, absoluteCenter);
      cardPositions.set(voterId, {
        left: columnLeft,
        right: columnRight,
        centerX: columnLeft + (columnRight - columnLeft) / 2,
        centerY: absoluteCenter,
      });

      if (columnIndex === 0) {
        const rowValue = Number(rowPositions?.get?.(voterId));
        if (Number.isFinite(rowValue)) {
          anchorEntries.push({ value: rowValue, center: absoluteCenter });
          hasSortedAnchors = false;
        }
      }

      if (bottom > columnHeight) {
        columnHeight = bottom;
      }

      placements.push({ top, bottom });
      card.style.top = `${top}px`;
    });

    columnEl.style.minHeight = `${Math.ceil(columnHeight)}px`;
    columnEl.style.paddingBottom = `${verticalGap}px`;
  });

  return cardPositions;
}

function getAnchorCenter(anchorEntries, target) {
  if (!Number.isFinite(target) || !Array.isArray(anchorEntries) || !anchorEntries.length) {
    return null;
  }

  const entries = anchorEntries;
  if (entries.length === 1) {
    return entries[0].center;
  }

  if (target <= entries[0].value) {
    return entries[0].center;
  }

  const lastEntry = entries[entries.length - 1];
  if (target >= lastEntry.value) {
    return lastEntry.center;
  }

  for (let index = 0; index < entries.length - 1; index += 1) {
    const current = entries[index];
    const next = entries[index + 1];
    if (target >= current.value && target <= next.value) {
      if (current.value === next.value) {
        return current.center;
      }
      const ratio = (target - current.value) / (next.value - current.value);
      return current.center + ratio * (next.center - current.center);
    }
  }

  return null;
}

function adjustTallyHeights(tallyColumn, tallies, referenceColumn) {
  if (!tallyColumn) {
    return;
  }

  const cards = Array.from(tallyColumn.querySelectorAll('.tally-card'));
  if (!cards.length) {
    return;
  }

  const referenceHeight = referenceColumn?.getBoundingClientRect().height ?? 0;
  const globalWindow = typeof window !== 'undefined' ? window : null;
  const computedStyle = globalWindow?.getComputedStyle
    ? globalWindow.getComputedStyle(tallyColumn)
    : null;
  const gapValue = computedStyle ? parseFloat(computedStyle.rowGap || computedStyle.gap || '0') : 0;
  const cardCount = cards.length;
  const intrinsicHeights = cards.map((card) => {
    const cached = Number(card.dataset.intrinsicHeight);
    if (Number.isFinite(cached) && cached > 0) {
      return cached;
    }
    const previousHeight = card.style.height;
    const previousMinHeight = card.style.minHeight;
    const previousFlex = card.style.flex;
    card.style.height = '';
    card.style.minHeight = '';
    card.style.flex = '';
    const rect = card.getBoundingClientRect();
    const measured = Math.max(Math.ceil(rect.height || card.scrollHeight || 0), 1);
    card.dataset.intrinsicHeight = String(measured);
    card.style.height = previousHeight;
    card.style.minHeight = previousMinHeight;
    card.style.flex = previousFlex;
    return measured;
  });
  const totalIntrinsicHeight = intrinsicHeights.reduce((acc, value) => acc + value, 0);
  const minTotalHeight = totalIntrinsicHeight + gapValue * Math.max(cardCount - 1, 0);
  const columnHeight = Math.max(referenceHeight, minTotalHeight);

  tallyColumn.style.height = `${Math.ceil(columnHeight)}px`;

  const totalVotes = cards.reduce((acc, card) => {
    const voteType = card.dataset.vote;
    return acc + (tallies[voteType] ?? 0);
  }, 0);

  const availableHeight = columnHeight - gapValue * Math.max(cardCount - 1, 0);
  const extraSpace = Math.max(availableHeight - totalIntrinsicHeight, 0);

  cards.forEach((card, index) => {
    const voteType = card.dataset.vote;
    const value = tallies[voteType] ?? 0;
    const badge = card.querySelector('.badge');
    if (badge) {
      badge.textContent = `${value} vote${value === 1 ? '' : 's'}`;
    }

    const baseHeight = intrinsicHeights[index] ?? 0;
    let targetHeight = baseHeight;
    if (totalVotes > 0) {
      targetHeight += extraSpace * (value / totalVotes);
    } else if (extraSpace > 0 && cardCount > 0) {
      targetHeight += extraSpace / cardCount;
    }

    const finalHeight = Math.max(targetHeight, baseHeight);
    card.style.minHeight = `${baseHeight}px`;
    card.style.height = `${finalHeight}px`;
    card.style.flex = `0 0 ${finalHeight}px`;
  });
}

function queueArrowRender(results) {
  if (!elements.canvasWrapper || !elements.canvasArrows) {
    return;
  }

  pendingArrowResults = results;

  if (pendingArrowTimeout) {
    clearTimeout(pendingArrowTimeout);
    pendingArrowTimeout = null;
  }

  if (pendingArrowFrame) {
    cancelFrame(pendingArrowFrame);
    pendingArrowFrame = null;
  }

  const delay = getCanvasTransitionDuration();
  const schedule = () => {
    pendingArrowFrame = scheduleFrame(() => {
      pendingArrowFrame = null;
      renderArrowPaths();
    });
  };

  if (delay > 0) {
    pendingArrowTimeout = setTimeout(() => {
      pendingArrowTimeout = null;
      schedule();
    }, delay);
  } else {
    schedule();
  }
}

function renderArrowPaths() {
  if (!pendingArrowResults) {
    return;
  }

  const positions = collectCanvasPositions();
  if (!positions || !elements.canvasArrows) {
    return;
  }

  elements.canvasArrows.innerHTML = '';
  drawArrows(positions, pendingArrowResults);
  pendingArrowResults = null;
}

function collectCanvasPositions() {
  if (!elements.canvasWrapper || !elements.canvas) {
    return null;
  }

  const wrapperRect = elements.canvasWrapper.getBoundingClientRect();
  const positions = new Map();

  elements.canvas.querySelectorAll('.canvas-card[data-id]').forEach((node) => {
    const rect = node.getBoundingClientRect();
    positions.set(node.dataset.id, {
      left: rect.left - wrapperRect.left,
      right: rect.right - wrapperRect.left,
      centerX: rect.left - wrapperRect.left + rect.width / 2,
      centerY: rect.top - wrapperRect.top + rect.height / 2,
    });
  });

  elements.canvas.querySelectorAll('.tally-card[data-id]').forEach((node) => {
    const rect = node.getBoundingClientRect();
    positions.set(node.dataset.id, {
      left: rect.left - wrapperRect.left,
      right: rect.right - wrapperRect.left,
      centerX: rect.left - wrapperRect.left + rect.width / 2,
      centerY: rect.top - wrapperRect.top + rect.height / 2,
    });
  });

  return positions;
}

function parseTimeValue(input) {
  if (typeof input !== 'string') {
    return 0;
  }
  const value = input.trim();
  if (!value) {
    return 0;
  }
  if (value.endsWith('ms')) {
    const number = parseFloat(value.slice(0, -2));
    return Number.isFinite(number) ? number : 0;
  }
  if (value.endsWith('s')) {
    const number = parseFloat(value.slice(0, -1));
    return Number.isFinite(number) ? number * 1000 : 0;
  }
  const fallback = parseFloat(value);
  return Number.isFinite(fallback) ? fallback : 0;
}

function getCanvasTransitionDuration() {
  const globalWindow = typeof window !== 'undefined' ? window : null;
  if (!globalWindow?.getComputedStyle || !elements.canvas) {
    return 0;
  }

  const sampleCard = elements.canvas.querySelector('.canvas-card');
  if (!sampleCard) {
    return 0;
  }

  const styles = globalWindow.getComputedStyle(sampleCard);
  if (!styles) {
    return 0;
  }

  const properties = (styles.transitionProperty || '').split(',');
  const durations = (styles.transitionDuration || '').split(',');
  const delays = (styles.transitionDelay || '').split(',');
  let maxDuration = 0;

  const getValue = (list, index) => list[index] ?? list[list.length - 1] ?? '0s';

  for (let index = 0; index < properties.length; index += 1) {
    const property = properties[index]?.trim();
    if (property && property !== 'all' && property !== 'top') {
      continue;
    }
    const duration = parseTimeValue(getValue(durations, index));
    const delay = parseTimeValue(getValue(delays, index));
    const total = duration + delay;
    if (total > maxDuration) {
      maxDuration = total;
    }
  }

  return maxDuration;
}

function drawArrows(positions, results) {
  const svg = elements.canvasArrows;
  const { width, height } = elements.canvasWrapper.getBoundingClientRect();
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const pathFor = (from, to, color) => {
    const start = positions.get(from);
    const end = positions.get(to);
    if (!start || !end) return null;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const startX = start.right;
    const endX = end.left;
    const startY = start.centerY;
    const endY = end.centerY;
    const gapPadding = 24;
    let bendX = endX - gapPadding;
    if (!Number.isFinite(bendX)) {
      bendX = (startX + endX) / 2;
    }
    const minimumBend = startX + 12;
    const maximumBend = endX - 8;
    if (!Number.isFinite(bendX) || bendX < minimumBend) {
      bendX = minimumBend;
    }
    if (bendX > maximumBend) {
      bendX = maximumBend;
    }
    const pathSegments = [
      `M ${startX} ${startY}`,
      `L ${bendX} ${startY}`,
      `L ${bendX} ${endY}`,
      `L ${endX} ${endY}`,
    ];
    path.setAttribute('d', pathSegments.join(' '));
    path.setAttribute('class', 'arrow-path');
    path.setAttribute('stroke', color);
    svg.appendChild(path);
  };

  const colors = {
    YES: 'rgba(34,197,94,0.85)',
    NO: 'rgba(249,115,22,0.85)',
    ABSTAIN: 'rgba(234,179,8,0.85)',
  };

  const edgeMap = new Map();

  for (const [voterId, resolution] of results.entries()) {
    if (!resolution || resolution.cycle) {
      continue;
    }
    const finalVote = resolution.finalVote;
    if (finalVote === 'ABSTAIN') {
      continue;
    }
    const chain = Array.isArray(resolution.chain) ? resolution.chain : [];
    if (!chain.length) {
      continue;
    }

    const color = colors[finalVote] ?? colors.ABSTAIN;

    for (let index = 0; index < chain.length - 1; index += 1) {
      const from = chain[index];
      const to = chain[index + 1];
      if (!from || !to) {
        continue;
      }
      const key = `${from}->${to}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { from, to, color });
      }
    }

    const last = chain[chain.length - 1];
    if (last) {
      const key = `${last}->${finalVote}-tally`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, { from: last, to: `${finalVote}-tally`, color });
      }
    }
  }

  edgeMap.forEach(({ from, to, color }) => {
    pathFor(from, to, color);
  });
}

function renderVotingTab() {
  const category = state.activeCategory;
  const resolution = computeVoteResolution(state, category);
  renderTally(resolution.tallies);
  renderCanvas(category, resolution);
}

function toggleSelection(voterId) {
  const exists = state.selectedVoters.includes(voterId);
  if (exists) {
    state.selectedVoters = state.selectedVoters.filter((id) => id !== voterId);
  } else {
    state.selectedVoters = [...state.selectedVoters, voterId];
  }
  updateCardSelection();
}

function selectSingle(voterId) {
  state.selectedVoters = [voterId];
  updateCardSelection();
}

function clearSelection() {
  state.selectedVoters = [];
  updateCardSelection();
}

function castVote(vote, voterIds = state.selectedVoters) {
  if (vote === 'ABSTAIN') {
    clearVotes(voterIds);
    return;
  }
  if (!VOTE_OPTIONS.includes(vote)) {
    return;
  }
  const category = state.activeCategory;
  const question = state.questionByCategory[category];
  if (!category || !question) {
    return;
  }
  const targets = Array.isArray(voterIds) ? [...new Set(voterIds)] : [];
  if (!targets.length) {
    return;
  }
  targets.forEach((voterId) => {
    upsertVote(state, { voterId, category, question, vote });
  });
  saveState();
  renderVotingTab();
}

function clearVotes(voterIds = state.selectedVoters) {
  const category = state.activeCategory;
  const question = state.questionByCategory[category];
  if (!category || !question) {
    return;
  }
  const targets = Array.isArray(voterIds) ? [...new Set(voterIds)] : [];
  if (!targets.length) {
    return;
  }
  targets.forEach((voterId) => {
    upsertVote(state, { voterId, category, question, vote: null });
  });
  saveState();
  renderVotingTab();
}

function clearAllVotes() {
  const category = state.activeCategory;
  const question = state.questionByCategory[category];
  const key = `${category}|${question}`;
  state.votes[key] = {};
  saveState();
  renderVotingTab();
}

function addSampleVoters() {
  const names = [
    'Alex Johnson',
    'Briana Chen',
    'Carlo Nguyen',
    'Diana Patel',
    'Evan Brooks',
    'Fatima Lopez',
  ];
  const newVoters = names.map((name, index) => ({
    id: generateId('demo'),
    name,
    isProxy: index % 2 === 0,
  }));
  state.voters.push(...newVoters);
  state.selectedPrincipal = newVoters[0]?.id ?? null;
  saveState();
  renderAll();
}

function setupTabs() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;
      elements.tabButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      elements.tabPanels.forEach((panel) => {
        const isActive = panel.id === target;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', String(!isActive));
      });
      if (target === 'voting') {
        renderVotingTab();
      } else if (target === 'proxy') {
        renderProxySetup();
      } else if (target === 'registration') {
        renderRegistration();
      }
    });
  });
}

function setupHandlers() {
  elements.registrationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name').trim();
    const isProxy = formData.get('isProxy') === 'on';
    if (!name) return;
    const voter = { id: generateId(), name, isProxy };
    state.voters.push(voter);
    event.target.reset();
    saveState();
    renderAll();
  });

  elements.addSampleData.addEventListener('click', () => {
    if (state.voters.length) return;
    addSampleVoters();
  });

  elements.categoryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = elements.newCategoryInput.value.trim();
    if (!name || state.categories.includes(name)) return;
    state.categories.push(name);
    state.activeCategory = name;
    state.questionByCategory[name] = DEFAULT_QUESTION;
    elements.newCategoryInput.value = '';
    saveState();
    renderAll();
  });

  elements.categorySelect.addEventListener('change', (event) => {
    state.activeCategory = event.target.value;
    saveState();
    renderProxySetup();
  });

  elements.voteCategory.addEventListener('change', (event) => {
    state.activeCategory = event.target.value;
    saveState();
    renderProxySetup();
  });

  elements.setQuestion.addEventListener('click', () => {
    const text = elements.voteQuestion.value.trim();
    if (!text) return;
    state.questionByCategory[state.activeCategory] = text;
    saveState();
    renderVotingTab();
  });

  elements.clearAllVotes.addEventListener('click', () => {
    clearAllVotes();
    clearSelection();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      clearSelection();
    }
  });
}

function updateCardSelection() {
  if (!elements.canvas) {
    return;
  }
  elements.canvas.querySelectorAll('.canvas-card[data-id]').forEach((node) => {
    const isSelected = state.selectedVoters.includes(node.dataset.id);
    node.classList.toggle('selected', isSelected);
  });
}

function handleCardVote(voterId, vote) {
  const isSelected = state.selectedVoters.includes(voterId);
  const hasGroupSelection = isSelected && state.selectedVoters.length > 1;
  if (!hasGroupSelection) {
    state.selectedVoters = [voterId];
    updateCardSelection();
  }
  castVote(vote, hasGroupSelection ? state.selectedVoters : [voterId]);
}

function renderAll() {
  renderRegistration();
  renderProxySetup();
  saveState();
}

if (doc) {
  setupTabs();
  setupHandlers();
  renderAll();
}
