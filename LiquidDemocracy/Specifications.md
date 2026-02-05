# Liquid Democracy Voting Application Specifications

## Overview

This is a web-based liquid democracy voting application that allows users to participate in democratic decision-making through both direct voting and proxy delegation. The system enables voters to delegate their voting power to trusted proxies for specific categories while maintaining the ability to vote directly on any issue.

## Core Concepts

### Liquid Democracy
- **Direct Democracy**: Voters can vote directly on any issue
- **Representative Democracy**: Voters can delegate their voting power to proxies
- **Hybrid Approach**: Voters can mix both approaches - vote directly on some issues and delegate others
- **Dynamic Delegation**: Voters can change their proxy relationships at any time

### Key Terms
- **Principal**: A voter who delegates their voting power to others
- **Proxy**: A voter who can receive delegated voting power from others
- **Vote Chain**: The path a vote follows through proxy relationships to reach a final vote
- **Category**: A topic area for which proxy relationships can be established
- **Question**: A specific voting question within a category

## Functional Requirements

### 1. Voter Registration
- Users can register as voters in the system
- Each voter has a unique name and identifier
- Voters can be designated as "proxy-capable" (able to receive delegations)
- The system supports adding, editing, and viewing voter information

### 2. Proxy Relationship Management
- Voters can establish proxy relationships for specific categories
- Each voter can delegate to multiple proxies in priority order (1st choice, 2nd choice, etc.)
- Proxy relationships are category-specific (e.g., Environment, Economy, Healthcare)
- Voters can modify their proxy relationships at any time
- The system prevents circular proxy relationships that would create infinite loops

### 3. Voting System
- Voters can cast direct votes on questions within categories
- Vote options: YES, NO, ABSTAIN
- Direct votes always override proxy delegation for that specific question
- Voters can change their votes at any time
- Voters can clear their votes (remove them entirely)

### 4. Vote Resolution Logic
- **Direct Vote**: If a voter votes directly, their vote is counted as-is
- **Proxy Chain Resolution**: If a voter doesn't vote directly, the system follows their proxy chain:
  1. Check if 1st proxy has voted directly → use that vote
  2. If not, check if 1st proxy has voted through their own proxies → follow that chain
  3. If 1st proxy has no vote, try 2nd proxy, then 3rd proxy, etc.
  4. If no vote found in entire chain → count as ABSTAIN
- **Cycle Detection**: System handles circular proxy relationships gracefully
- **Live Updates**: Vote tallies update immediately when votes are cast or proxy relationships change

### 5. Visual Vote Flow
- Real-time visualization of how votes flow through proxy relationships
- Cards representing voters that move horizontally based on delegation depth
- Arrows showing the flow of votes from principals to proxies
- Cards arrange in columns based on their position in delegation chains
- Visual indicators for voters who voted directly vs. those whose votes came through proxies
- Arrows terminate at tally boxes showing final vote counts

## User Interface Requirements

### 1. Registration Tab
- Form to add new voters
- List of existing voters with edit capabilities
- Toggle for proxy capability
- Clean, intuitive interface for voter management

### 2. Proxy Setup Tab
- Three-column layout:
  - **Left**: List of all voters (select principal)
  - **Center**: Current proxy assignments for selected principal
  - **Right**: Available proxy-capable voters
- Category selection at the top
- Drag-and-drop or click-to-add proxy assignment
- Visual indication of proxy priority order
- Real-time updates when proxy relationships change

### 3. Voting Tab
- Category and question selectors at the top
- "Clear All Votes" button to reset all votes
- Dynamic layout showing voter cards positioned based on delegation chains
- Vote flow visualization with animated arrows
- Voting interface:
  - Click to select one or more voter cards
  - Vote buttons: YES, NO, ABSTAIN, Clear Vote
  - Selected voters show visual selection indicators
- Right panel with vote tally boxes showing results
- Real-time updates as votes are cast

### 4. Visual Layout System
- **Column Organization**:
  - Column 0 (leftmost): Principals who delegate to others
  - Column 1: First-level proxies
  - Column 2: Second-level proxies, etc.
  - Rightmost: Final vote destinations (tally boxes)
- **Vertical Positioning**:
  - Cards within each column are sorted intelligently
  - Leftmost column sorted by vote type (YES voters at top, then ABSTAIN, then NO)
  - Other columns sorted by which proxy they delegate to
  - No gaps between cards within columns
- **Empty Column Removal**: When delegation creates empty columns, they are automatically removed
- **Arrow Positioning**: Arrows point from card edges to show vote flow, passing behind cards

### 5. Real-time Updates
- All changes (votes, proxy relationships, voter registration) update immediately across all tabs
- Visual animations smooth transitions when cards move positions
- Vote tallies update live
- Arrow flows update to reflect new vote paths

## Technical Requirements

### State Management
- Centralized state management for:
  - Voter list and properties
  - Proxy relationships (by category)
  - Cast votes (by category and question)
  - Current UI selections (selected voters, current category/question)
- Immutable state updates
- Persistence of data across browser sessions

### Vote Calculation Engine
- Algorithm to resolve vote chains efficiently
- Cycle detection in proxy relationships
- Real-time recalculation when data changes
- Optimized for performance with large numbers of voters

### Layout Calculation Engine
- Dynamic positioning algorithm for voter cards
- Column assignment based on delegation depth
- Intelligent sorting within columns
- Empty column compaction
- Arrow path calculation between cards and tally boxes
- Responsive design for different screen sizes

### Animation System
- Smooth transitions when cards move positions
- Arrow animations showing vote flow
- Visual feedback for user interactions
- Performance-optimized animations that don't interfere with layout calculations

## Data Models

### Voter
```
{
  id: string (unique identifier)
  name: string
  isProxy: boolean (can receive delegations)
}
```

### Proxy Relationship
```
{
  principalId: string (voter who delegates)
  proxyIds: string[] (ordered list of proxy voters)
  category: string
}
```

### Vote
```
{
  voterId: string
  vote: "YES" | "NO" | "ABSTAIN"
  category: string
  question: string
  timestamp: number
}
```

### Vote Chain
```
{
  principalId: string (original voter)
  chainIds: string[] (path from principal to final vote source)
  finalVote: "YES" | "NO" | "ABSTAIN"
  category: string
  question: string
}
```

## Behavior Specifications

### Proxy Chain Resolution
1. Start with a voter who hasn't voted directly
2. Find their proxy relationships for the current category
3. Check each proxy in priority order:
   - If proxy voted directly → use that vote
   - If proxy has own proxy chain → recursively follow that chain
   - If no vote found → try next proxy in priority order
4. If no vote found in entire chain → default to ABSTAIN
5. Detect and handle circular references gracefully

### Visual Layout Algorithm
1. **Column Assignment**: Assign each voter to a column based on their depth in delegation chains
2. **Column Organization**: Group voters by their assigned columns
3. **Sorting**: Sort voters within each column:
   - Column 0: By final vote type (YES, ABSTAIN, NO)
   - Other columns: By which proxy they delegate to
4. **Positioning**: Position cards sequentially within columns with no gaps
5. **Proxy Centering**: Center proxies vertically on their incoming connections
6. **Empty Column Removal**: Remove columns with no voters and compact remaining columns

### Arrow Flow Calculation
1. **Delegation Arrows**: Draw arrows between consecutive voters in delegation chains
2. **Tally Arrows**: Draw arrows from final vote sources to appropriate tally boxes
3. **Positioning**: Arrows start from right edge of cards and end at left edge of target cards
4. **Styling**: Different colors based on vote type (green for YES, red for NO)
5. **Z-Index**: Arrows render behind cards to avoid visual obstruction

### User Interaction Flows
1. **Adding Voters**: Registration → Immediate appearance in proxy setup and voting
2. **Setting Proxies**: Category selection → Principal selection → Proxy assignment → Live preview
3. **Casting Votes**: Category/Question selection → Voter selection → Vote casting → Immediate visual update
4. **Changing Votes**: Select voted cards → Choose new vote option → Immediate recalculation
5. **Clearing Votes**: Either clear specific voter votes or all votes globally

## Quality Requirements

### Performance
- Smooth 60fps animations
- Responsive layout calculations even with 50+ voters
- Instant vote recalculation
- Efficient memory usage

### Usability
- Intuitive interface requiring no training
- Clear visual feedback for all interactions
- Accessible design following web accessibility guidelines
- Mobile-responsive layout

### Reliability
- Consistent state management
- Graceful error handling
- Data validation and integrity checks
- Browser compatibility

### Maintainability
- Modular, well-documented code
- Separation of concerns (UI, business logic, data)
- Comprehensive testing coverage
- Clear architectural patterns

## Success Criteria

The application successfully demonstrates liquid democracy when:
1. Users can easily set up proxy relationships and understand the implications
2. Vote flow is clearly visualized and updates in real-time
3. Complex proxy chains resolve correctly to final votes
4. The interface is intuitive enough for non-technical users
5. Performance remains smooth even with complex delegation networks
6. All edge cases (cycles, empty chains, etc.) are handled gracefully

This specification provides a complete blueprint for building a liquid democracy voting application that balances the complexity of the underlying voting system with an intuitive, visual user experience.