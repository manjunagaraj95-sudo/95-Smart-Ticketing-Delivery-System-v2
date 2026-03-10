
import React, { useState, useEffect } from 'react';

// --- ICONS (Placeholder) ---
const Icon = ({ name, className = '', style = {} }) => {
    const icons = {
        'dashboard': '🏠',
        'tickets': '🎟️',
        'analytics': '📊',
        'settings': '⚙️',
        'search': '🔍',
        'bell': '🔔',
        'user': '👤',
        'chevron-right': '›',
        'check': '✅',
        'alert': '⚠️',
        'upload': '⬆️',
        'filter': '🎚️',
        'sort': '↕️',
        'export': '📤',
        'edit': '✍️',
        'delete': '🗑️',
        'add': '➕',
        'history': '📜',
        'document': '📄',
        'related': '🔗',
        'trend-up': '📈',
        'trend-down': '📉',
        'info': 'ℹ️',
    };
    return <span className={`icon ${className}`} style={{ fontSize: 'var(--font-size-base)', ...style }}>{icons[name]}</span>;
};

// --- ROLES & RBAC Configuration ---
const ROLES = {
    ADMIN: 'ADMIN',
    CLIENT: 'CLIENT', // Assuming admin client, but defining roles for future scalability
};

const currentUserRole = ROLES.ADMIN; // Current user is an Admin Client

const hasPermission = (permission) => {
    const rolePermissions = {
        [ROLES.ADMIN]: {
            canViewDashboard: true,
            canViewTickets: true,
            canViewAnalytics: true,
            canViewSettings: true,
            canCreateTicket: true,
            canEditTicket: true,
            canDeleteTicket: true,
            canApproveWorkflow: true,
            canViewAuditLogs: true,
            canExportData: true,
        },
        [ROLES.CLIENT]: { // Example for a non-admin client
            canViewDashboard: true,
            canViewTickets: true,
            canViewAnalytics: false,
            canViewSettings: true,
            canCreateTicket: true,
            canEditTicket: false,
            canDeleteTicket: false,
            canApproveWorkflow: false,
            canViewAuditLogs: false,
            canExportData: false,
        },
    };
    return rolePermissions[currentUserRole]?.[permission] || false;
};

// --- DUMMY DATA ---
let dummyTickets = [ // Use `let` because we'll simulate updates for workflow demo
    {
        id: 'TKT001',
        title: 'Network Connectivity Issue - Branch A',
        description: 'Users in Branch A are experiencing intermittent network connectivity issues, affecting critical business operations. Requires urgent investigation and resolution.',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Alice Smith',
        createdDate: '2023-10-26T10:00:00Z',
        dueDate: '2023-10-29T17:00:00Z',
        workflowStage: 'Investigation',
        slaStatus: 'On Track',
        attachments: [
            { name: 'network-log-branchA.txt', url: '#', type: 'text' },
            { name: 'branchA-diagram.pdf', url: '#', type: 'pdf' }
        ],
        relatedRecords: [
            { id: 'ASSET005', type: 'Asset', name: 'Router A1' },
            { id: 'REQ010', type: 'Request', name: 'New VPN Setup' }
        ]
    },
    {
        id: 'TKT002',
        title: 'Software Update Deployment - Q4',
        description: 'Plan and execute the quarterly software update deployment across all workstations and servers. Coordinate with IT and departmental heads.',
        status: 'Pending',
        priority: 'Medium',
        assignee: 'Bob Johnson',
        createdDate: '2023-10-25T14:30:00Z',
        dueDate: '2023-11-15T17:00:00Z',
        workflowStage: 'Planning',
        slaStatus: 'On Track',
        attachments: [],
        relatedRecords: []
    },
    {
        id: 'TKT003',
        title: 'Server Migration to Cloud - Phase 1',
        description: 'Migrate critical legacy servers to the new cloud infrastructure. Requires downtime planning and data integrity checks.',
        status: 'Approved',
        priority: 'High',
        assignee: 'Charlie Brown',
        createdDate: '2023-10-20T09:00:00Z',
        dueDate: '2023-11-05T17:00:00Z',
        workflowStage: 'Deployment',
        slaStatus: 'Completed',
        attachments: [],
        relatedRecords: []
    },
    {
        id: 'TKT004',
        title: 'New User Onboarding - Sarah Davis',
        description: 'Set up accounts, access permissions, and provide necessary hardware for new employee Sarah Davis.',
        status: 'In Progress',
        priority: 'Low',
        assignee: 'Diana Prince',
        createdDate: '2023-10-27T11:00:00Z',
        dueDate: '2023-10-30T09:00:00Z',
        workflowStage: 'Provisioning',
        slaStatus: 'Breaching Soon',
        attachments: [],
        relatedRecords: []
    },
    {
        id: 'TKT005',
        title: 'Database Backup Failure Alert',
        description: 'Automated system detected a failure in daily database backup for production server. Immediate attention required.',
        status: 'Rejected',
        priority: 'Critical',
        assignee: 'Alice Smith',
        createdDate: '2023-10-28T03:00:00Z',
        dueDate: '2023-10-28T09:00:00Z',
        workflowStage: 'Resolution',
        slaStatus: 'Breached',
        attachments: [],
        relatedRecords: []
    },
    {
        id: 'TKT006',
        title: 'Printer Malfunction - HR Dept',
        description: 'Printer in HR department is not printing documents from any workstation. Check network connection and printer status.',
        status: 'Exception', // Example for 'Exception' status
        priority: 'Medium',
        assignee: 'Eve Adams',
        createdDate: '2023-10-27T13:00:00Z',
        dueDate: '2023-10-28T12:00:00Z',
        workflowStage: 'Escalation',
        slaStatus: 'Breaching Soon',
        attachments: [],
        relatedRecords: []
    },
    {
        id: 'TKT007',
        title: 'User Access Request - John Doe',
        description: 'Grant new user John Doe access to CRM and ERP systems.',
        status: 'Approved',
        priority: 'Low',
        assignee: 'Eve Adams',
        createdDate: '2023-10-20T08:00:00Z',
        dueDate: '2023-10-21T17:00:00Z',
        workflowStage: 'Closed', // Explicitly closed for KPI demo
        slaStatus: 'Completed',
        attachments: [],
        relatedRecords: []
    },
];

const dummyActivities = [
    { id: 1, ticketId: 'TKT001', type: 'Status Update', user: 'Admin Client', timestamp: '2023-10-28T10:30:00Z', details: 'Status changed from "Pending" to "In Progress".' },
    { id: 2, ticketId: 'TKT001', type: 'Comment', user: 'Alice Smith', timestamp: '2023-10-28T10:45:00Z', details: 'Initiated diagnostic tests on router configuration.' },
    { id: 3, ticketId: 'TKT002', type: 'Assignment', user: 'System', timestamp: '2023-10-26T15:00:00Z', details: 'Assigned to Bob Johnson.' },
    { id: 4, ticketId: 'TKT003', type: 'Approval', user: 'Charlie Brown', timestamp: '2023-10-21T11:00:00Z', details: 'Approved migration plan by IT Lead.' },
    { id: 5, ticketId: 'TKT005', type: 'Status Update', user: 'Admin Client', timestamp: '2023-10-28T09:00:00Z', details: 'Backup failure ticket marked as "Rejected" due to manual overwrite.' },
    { id: 6, ticketId: 'TKT006', type: 'Escalation', user: 'Eve Adams', timestamp: '2023-10-27T16:00:00Z', details: 'Escalated to network team due to hardware fault suspected.' },
];

const workflowMilestones = [
    { stage: 'New', order: 1 },
    { stage: 'Planning', order: 2 },
    { stage: 'Investigation', order: 3 },
    { stage: 'Provisioning', order: 4 },
    { stage: 'Deployment', order: 5 },
    { stage: 'Resolution', order: 6 },
    { stage: 'Approval', order: 7 },
    { stage: 'Closed', order: 8 },
];

// --- HELPER FUNCTIONS ---
const getStatusClass = (status) => {
    switch (status) {
        case 'Approved': return 'status-approved';
        case 'In Progress': return 'status-in-progress';
        case 'Pending': return 'status-pending';
        case 'Rejected': return 'status-rejected';
        case 'Exception': return 'status-exception';
        default: return '';
    }
};

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
};

const getStatusColorVar = (status) => {
    switch (status) {
        case 'Approved': return 'var(--status-approved-border)';
        case 'In Progress': return 'var(--status-in-progress-border)';
        case 'Pending': return 'var(--status-pending-border)';
        case 'Rejected': return 'var(--status-rejected-border)';
        case 'Exception': return 'var(--status-exception-border)';
        default: return 'var(--text-secondary)';
    }
};


// --- COMPONENTS ---

const Header = ({ navigateTo, currentScreen }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        // Implement smart suggestions here later
    };

    return (
        <header className="app-header glass-effect">
            <a href="#" className="app-logo" onClick={() => navigateTo('DASHBOARD')}>Smart Tickets</a>
            <nav className="flex-row gap-sm">
                {hasPermission('canViewDashboard') && (
                    <a
                        href="#"
                        className={`nav-link ${currentScreen === 'DASHBOARD' ? 'active' : ''}`}
                        onClick={() => navigateTo('DASHBOARD')}
                    >
                        <Icon name="dashboard" /> Dashboard
                    </a>
                )}
                {hasPermission('canViewTickets') && (
                    <a
                        href="#"
                        className={`nav-link ${['TICKETS', 'TICKET_DETAIL'].includes(currentScreen) ? 'active' : ''}`}
                        onClick={() => navigateTo('TICKETS')}
                    >
                        <Icon name="tickets" /> Tickets
                    </a>
                )}
                {hasPermission('canViewAnalytics') && (
                    <a
                        href="#"
                        className={`nav-link ${currentScreen === 'ANALYTICS' ? 'active' : ''}`}
                        onClick={() => navigateTo('ANALYTICS')}
                    >
                        <Icon name="analytics" /> Analytics
                    </a>
                )}
                {hasPermission('canViewSettings') && (
                    <a
                        href="#"
                        className={`nav-link ${currentScreen === 'SETTINGS' ? 'active' : ''}`}
                        onClick={() => navigateTo('SETTINGS')}
                    >
                        <Icon name="settings" /> Settings
                    </a>
                )}
            </nav>
            <div className="global-search">
                <Icon name="search" className="search-icon" />
                <input
                    type="text"
                    className="input-field"
                    placeholder="Search all tickets, users, and documents..."
                    value={searchQuery}
                    onChange={handleSearch}
                />
            </div>
            <div className="flex-row gap-md">
                <button className="button button-secondary"><Icon name="bell" /></button>
                <button className="button button-secondary"><Icon name="user" /> Admin</button>
            </div>
        </header>
    );
};

const Breadcrumbs = ({ path, navigateTo }) => {
    return (
        <nav className="breadcrumbs container">
            {path.map((item, index) => (
                <React.Fragment key={item.name}>
                    <a href="#" onClick={() => navigateTo(item.screen, item.params)}>{item.name}</a>
                    {index < path.length - 1 && <span><Icon name="chevron-right" /></span>}
                </React.Fragment>
            ))}
        </nav>
    );
};

const DashboardScreen = ({ navigateTo }) => {
    const kpis = [
        { name: 'Total Tickets', value: dummyTickets.length, trend: '+5%', type: 'up', status: 'Approved' },
        { name: 'Open Tickets', value: dummyTickets.filter(t => t.workflowStage !== 'Closed').length, trend: '-2%', type: 'down', status: 'In Progress' },
        { name: 'Closed Tickets', value: dummyTickets.filter(t => t.workflowStage === 'Closed').length, trend: '+8%', type: 'up', status: 'Approved' }, // NEW KPI
        { name: 'Tickets Due Soon', value: dummyTickets.filter(t => t.slaStatus === 'Breaching Soon').length, trend: '+10%', type: 'up', status: 'Pending' },
        { name: 'SLA Breaches', value: dummyTickets.filter(t => t.slaStatus === 'Breached').length, trend: '+3%', type: 'up', status: 'Rejected' },
    ];

    const handleCardClick = (kpiName) => {
        // Example: clicking 'Open Tickets' navigates to Tickets screen with a filter
        if (kpiName === 'Open Tickets') {
            navigateTo('TICKETS', { statusFilter: 'open' });
        } else if (kpiName === 'Tickets Due Soon') {
            navigateTo('TICKETS', { slaFilter: 'breaching' });
        } else if (kpiName === 'Closed Tickets') { // Handle new KPI click
            navigateTo('TICKETS', { workflowStageFilter: 'Closed' });
        } else {
            navigateTo('TICKETS');
        }
    };

    return (
        <div className="container flex-col gap-lg">
            <h1 className="text-3xl font-bold" style={{ marginBottom: 'var(--spacing-md)' }}>Dashboard</h1>

            <section className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)' }}>
                {kpis.map((kpi, index) => (
                    <div
                        key={index}
                        className={`card card-clickable flex-col gap-sm realtime-pulse`}
                        onClick={() => handleCardClick(kpi.name)}
                        style={{ borderLeft: `5px solid ${getStatusColorVar(kpi.status)}` }}
                    >
                        <h2 className="text-lg text-secondary font-semibold">{kpi.name}</h2>
                        <div className="flex-row justify-between align-end">
                            <span className="text-3xl font-bold">{kpi.value}</span>
                            <span className={`text-sm font-semibold ${kpi.type === 'up' ? 'status-approved-text' : 'status-rejected-text'}`}>
                                <Icon name={kpi.type === 'up' ? 'trend-up' : 'trend-down'} /> {kpi.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            <section className="flex-col gap-md">
                <h2 className="text-2xl font-bold">Real-time Performance</h2>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-md)' }}>
                    <div className="card flex-col gap-md">
                        <h3 className="text-xl font-semibold">Tickets by Status (Donut)</h3>
                        <div className="chart-container">Donut Chart Placeholder</div>
                    </div>
                    <div className="card flex-col gap-md">
                        <h3 className="text-xl font-semibold">Tickets Created vs. Closed (Line)</h3>
                        <div className="chart-container">Line Chart Placeholder</div>
                    </div>
                    <div className="card flex-col gap-md">
                        <h3 className="text-xl font-semibold">Average Resolution Time (Gauge)</h3>
                        <div className="chart-container">Gauge Chart Placeholder</div>
                    </div>
                    <div className="card flex-col gap-md">
                        <h3 className="text-xl font-semibold">Top Assignees (Bar)</h3>
                        <div className="chart-container">Bar Chart Placeholder</div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const TicketsScreen = ({ navigateTo, params }) => {
    const [tickets, setTickets] = useState(dummyTickets);
    const [filters, setFilters] = useState({
        status: params?.statusFilter || '',
        sla: params?.slaFilter || '',
        workflowStage: params?.workflowStageFilter || '', // NEW FILTER PARAM
        search: '',
    });
    const [sort, setSort] = useState({ key: 'createdDate', order: 'desc' });
    const [selectedTickets, setSelectedTickets] = useState([]);

    useEffect(() => {
        // Apply initial filters from params
        setFilters(prev => ({
            ...prev,
            status: params?.statusFilter || '',
            sla: params?.slaFilter || '',
            workflowStage: params?.workflowStageFilter || '' // Update initial filter logic
        }));
        // Re-fetch or re-evaluate dummyTickets if they change globally (not ideal for React, but for this demo)
        setTickets(dummyTickets);
    }, [params]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        // In a real app, this would trigger a data fetch
    };

    const handleSort = (key) => {
        setSort(prev => ({
            key,
            order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
        }));
    };

    const toggleTicketSelection = (ticketId) => {
        setSelectedTickets(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    const performBulkAction = (action) => {
        alert(`Performing ${action} on ${selectedTickets.length} tickets.`);
        // In a real app, send API call and then refresh grid data
        setSelectedTickets([]); // Clear selection after action
    };

    const filteredAndSortedTickets = tickets
        .filter(ticket => {
            if (filters.status && filters.status === 'open') {
                if (ticket.workflowStage === 'Closed') return false; // Redefined 'open' based on workflowStage
            } else if (filters.status && ticket.status !== filters.status) {
                return false;
            }
            if (filters.sla && filters.sla === 'breaching' && ticket.slaStatus !== 'Breaching Soon') {
                return false;
            }
            if (filters.workflowStage && ticket.workflowStage !== filters.workflowStage) { // NEW FILTER LOGIC
                return false;
            }
            if (filters.search && !ticket.title.toLowerCase().includes(filters.search.toLowerCase()) && !ticket.id.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            const valA = a?.[sort.key];
            const valB = b?.[sort.key];
            if (valA === valB) return 0;
            if (sort.order === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });

    const renderEmptyState = () => (
        <div className="empty-state card">
            <span className="illustration"><Icon name="info" /></span>
            <h3>No Tickets Found</h3>
            <p>It looks like there are no tickets matching your current criteria. Try adjusting your filters or create a new ticket.</p>
            {hasPermission('canCreateTicket') && (
                <button className="button button-primary" onClick={() => alert('Open new ticket form')}>
                    <Icon name="add" /> Create New Ticket
                </button>
            )}
        </div>
    );

    return (
        <div className="container flex-col gap-lg">
            <h1 className="text-3xl font-bold" style={{ marginBottom: 'var(--spacing-md)' }}>Tickets Overview</h1>

            <div className="card flex-col gap-md">
                <div className="flex-row justify-between align-center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Search by ID or Title..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            style={{ width: '250px' }}
                        />
                        <select
                            className="input-field"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">All Statuses</option>
                            <option value="Approved">Approved</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Exception">Exception</option>
                        </select>
                        <select
                            className="input-field"
                            value={filters.sla}
                            onChange={(e) => handleFilterChange('sla', e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">All SLA Statuses</option>
                            <option value="On Track">On Track</option>
                            <option value="Breaching Soon">Breaching Soon</option>
                            <option value="Breached">Breached</option>
                            <option value="Completed">Completed</option>
                        </select>
                        {/* New workflow stage filter for consistency */}
                        <select
                            className="input-field"
                            value={filters.workflowStage}
                            onChange={(e) => handleFilterChange('workflowStage', e.target.value)}
                            style={{ minWidth: '150px' }}
                        >
                            <option value="">All Stages</option>
                            {workflowMilestones.map(milestone => (
                                <option key={milestone.stage} value={milestone.stage}>
                                    {milestone.stage}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-row gap-sm" style={{ flexWrap: 'wrap' }}>
                        <button className="button button-secondary"><Icon name="filter" /> Filters</button>
                        <button className="button button-secondary"><Icon name="sort" /> Saved Views</button>
                        {hasPermission('canExportData') && <button className="button button-secondary"><Icon name="export" /> Export</button>}
                        {hasPermission('canCreateTicket') && (
                            <button className="button button-primary" onClick={() => alert('Open new ticket form')}>
                                <Icon name="add" /> New Ticket
                            </button>
                        )}
                    </div>
                </div>

                {selectedTickets.length > 0 && (
                    <div className="flex-row gap-md" style={{ padding: 'var(--spacing-sm)', backgroundColor: 'var(--status-in-progress-bg)', borderRadius: 'var(--border-radius-sm)' }}>
                        <span className="text-sm font-semibold">{selectedTickets.length} tickets selected:</span>
                        {hasPermission('canEditTicket') && <button className="button button-secondary" onClick={() => performBulkAction('edit')}>Bulk Edit</button>}
                        {hasPermission('canDeleteTicket') && <button className="button button-secondary" onClick={() => performBulkAction('delete')}>Bulk Delete</button>}
                        {hasPermission('canApproveWorkflow') && <button className="button button-primary" onClick={() => performBulkAction('approve')}>Bulk Approve</button>}
                    </div>
                )}

                {filteredAndSortedTickets.length === 0 ? renderEmptyState() : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-grid">
                            <thead>
                                <tr>
                                    <th><input type="checkbox" checked={selectedTickets.length === filteredAndSortedTickets.length && filteredAndSortedTickets.length > 0} onChange={() => setSelectedTickets(prev => prev.length === filteredAndSortedTickets.length ? [] : filteredAndSortedTickets.map(t => t.id))} /></th>
                                    <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>Ticket ID <Icon name="sort" /></th>
                                    <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>Title <Icon name="sort" /></th>
                                    <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status <Icon name="sort" /></th>
                                    <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer' }}>Priority <Icon name="sort" /></th>
                                    <th onClick={() => handleSort('assignee')} style={{ cursor: 'pointer' }}>Assignee <Icon name="sort" /></th>
                                    <th onClick={() => handleSort('createdDate')} style={{ cursor: 'pointer' }}>Created <Icon name="sort" /></th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedTickets.map(ticket => (
                                    <tr key={ticket.id} onClick={() => navigateTo('TICKET_DETAIL', { ticketId: ticket.id })}>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedTickets.includes(ticket.id)}
                                                onChange={() => toggleTicketSelection(ticket.id)}
                                            />
                                        </td>
                                        <td>{ticket.id}</td>
                                        <td>{ticket.title}</td>
                                        <td><span className={`status-tag ${getStatusClass(ticket.status)}`}>{ticket.status}</span></td>
                                        <td>{ticket.priority}</td>
                                        <td>{ticket.assignee}</td>
                                        <td>{formatDateTime(ticket.createdDate)}</td>
                                        <td className="grid-actions" onClick={(e) => e.stopPropagation()}>
                                            {hasPermission('canEditTicket') && (
                                                <button className="button button-secondary" onClick={() => alert(`Edit ${ticket.id}`)}>
                                                    <Icon name="edit" />
                                                </button>
                                            )}
                                            {hasPermission('canDeleteTicket') && (
                                                <button className="button button-secondary" onClick={() => alert(`Delete ${ticket.id}`)}>
                                                    <Icon name="delete" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const TicketDetailScreen = ({ navigateTo, params }) => {
    const ticketId = params?.ticketId;
    const [currentTicket, setCurrentTicket] = useState(dummyTickets.find(t => t.id === ticketId));
    const activities = dummyActivities.filter(a => a.ticketId === ticketId);

    // Update currentTicket if dummyTickets changes globally (for demo purposes)
    useEffect(() => {
        setCurrentTicket(dummyTickets.find(t => t.id === ticketId));
    }, [ticketId]);


    if (!currentTicket) {
        return (
            <div className="container flex-col gap-lg">
                <Breadcrumbs path={[{ name: 'Tickets', screen: 'TICKETS' }, { name: 'Not Found', screen: 'TICKET_DETAIL', params: { ticketId } }]} navigateTo={navigateTo} />
                <div className="card empty-state">
                    <span className="illustration"><Icon name="alert" /></span>
                    <h3>Ticket Not Found</h3>
                    <p>The ticket you are looking for does not exist or you do not have permission to view it.</p>
                    <button className="button button-primary" onClick={() => navigateTo('TICKETS')}>Back to Tickets</button>
                </div>
            </div>
        );
    }

    const currentMilestoneOrder = workflowMilestones.find(m => m.stage === currentTicket.workflowStage)?.order || 0;

    const handleEditClick = () => {
        alert(`Opening edit form for Ticket ${currentTicket.id}`);
        // In a real app, this would change view to an edit form
    };

    const handleWorkflowAction = (action) => {
        alert(`Performing workflow action '${action}' on Ticket ${currentTicket.id}`);
        // In a real app, this would update the ticket's workflowStage via API
        // For demo, we'll simulate a state change
        const currentStageIndex = workflowMilestones.findIndex(m => m.stage === currentTicket.workflowStage);
        if (action === 'advance' && currentStageIndex < workflowMilestones.length - 1) {
            const nextStage = workflowMilestones[currentStageIndex + 1]?.stage;
            if (nextStage) {
                 // Immutable state update for the demo global dummyTickets
                 dummyTickets = dummyTickets.map(t => t.id === currentTicket.id ? { ...t, workflowStage: nextStage } : t);
                 setCurrentTicket(prev => ({ ...prev, workflowStage: nextStage })); // Update local state for immediate UI refresh
                 // In a real app, this would likely trigger a re-fetch of the ticket data
            }
        }
    };


    return (
        <div className="container flex-col gap-lg">
            <Breadcrumbs path={[{ name: 'Tickets', screen: 'TICKETS' }, { name: currentTicket.id, screen: 'TICKET_DETAIL', params: { ticketId } }]} navigateTo={navigateTo} />

            <div className="flex-row justify-between align-center" style={{ marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                <h1 className="text-3xl font-bold">{currentTicket.title} <span className="text-xl font-normal text-secondary">({currentTicket.id})</span></h1>
                <div className="flex-row gap-md">
                    {hasPermission('canEditTicket') && (
                        <button className="button button-secondary" onClick={handleEditClick}>
                            <Icon name="edit" /> Edit
                        </button>
                    )}
                    {hasPermission('canApproveWorkflow') && (
                         <button className="button button-primary" onClick={() => handleWorkflowAction('advance')}>
                            <Icon name="check" /> Advance Workflow
                        </button>
                    )}
                </div>
            </div>

            {/* Record Summary */}
            <div className="card flex-col gap-md">
                <h2 className="text-2xl font-bold">Summary</h2>
                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md) var(--spacing-xl)' }}>
                    <div><span className="font-semibold text-secondary">Status:</span> <span className={`status-tag ${getStatusClass(currentTicket.status)}`}>{currentTicket.status}</span></div>
                    <div><span className="font-semibold text-secondary">Priority:</span> {currentTicket.priority}</div>
                    <div><span className="font-semibold text-secondary">Assignee:</span> {currentTicket.assignee}</div>
                    <div><span className="font-semibold text-secondary">Created:</span> {formatDateTime(currentTicket.createdDate)}</div>
                    <div><span className="font-semibold text-secondary">Due Date:</span> {formatDateTime(currentTicket.dueDate)}</div>
                    <div><span className="font-semibold text-secondary">SLA Status:</span> {currentTicket.slaStatus} {currentTicket.slaStatus?.includes('Breach') && <Icon name="alert" />}</div>
                    <div style={{ gridColumn: '1 / -1' }}><span className="font-semibold text-secondary">Description:</span> {currentTicket.description}</div>
                </div>
            </div>

            {/* Milestone Tracker (Workflow Progress) */}
            <div className="card flex-col gap-md">
                <h2 className="text-2xl font-bold">Workflow Progress</h2>
                <div className="milestone-tracker">
                    {workflowMilestones.map((milestone, index) => (
                        <div
                            key={milestone.stage}
                            className={`milestone-stage ${milestone.order <= currentMilestoneOrder ? 'completed' : ''} ${milestone.stage === currentTicket.workflowStage ? 'current' : ''}`}
                        >
                            <div className="milestone-circle">
                                {milestone.order <= currentMilestoneOrder && <Icon name="check" style={{ fontSize: 'var(--font-size-lg)' }} />}
                                {milestone.order > currentMilestoneOrder && milestone.stage === currentTicket.workflowStage && <Icon name="info" style={{ fontSize: 'var(--font-size-lg)' }} />}
                                {milestone.order > currentMilestoneOrder && milestone.stage !== currentTicket.workflowStage && <span>{milestone.order}</span>}
                            </div>
                            <div className="milestone-label">{milestone.stage}</div>
                        </div>
                    ))}
                </div>
                {currentTicket.slaStatus && (
                    <p className="text-sm" style={{ marginTop: 'var(--spacing-sm)', color: currentTicket.slaStatus.includes('Breach') ? 'var(--status-rejected-text)' : 'var(--status-approved-text)' }}>
                        <Icon name="info" /> SLA Status: {currentTicket.slaStatus}
                    </p>
                )}
            </div>

            {/* News/Audit Feed */}
            {hasPermission('canViewAuditLogs') && (
                <div className="card flex-col gap-md">
                    <h2 className="text-2xl font-bold">Activity Feed</h2>
                    <div className="activity-feed">
                        {activities?.length > 0 ? (
                            activities.map(activity => (
                                <div key={activity.id} className="activity-feed-item">
                                    <p className="text-base">
                                        <span className="font-semibold">{activity.user}</span> {activity.details}
                                    </p>
                                    <span className="timestamp">{formatDateTime(activity.timestamp)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-secondary">No recent activity for this ticket.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Related Records */}
            {currentTicket.relatedRecords?.length > 0 && (
                <div className="card flex-col gap-md">
                    <h2 className="text-2xl font-bold">Related Records</h2>
                    <div className="flex-col gap-sm">
                        {currentTicket.relatedRecords.map((record, index) => (
                            <div key={index} className="flex-row gap-sm align-center">
                                <Icon name="related" />
                                <span className="font-semibold">{record.type}:</span>
                                <a href="#" onClick={() => alert(`Navigating to ${record.type} ${record.id}`)} className="text-secondary">
                                    {record.name} ({record.id})
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Document Preview / Attachments */}
            {currentTicket.attachments?.length > 0 && (
                <div className="card flex-col gap-md">
                    <h2 className="text-2xl font-bold">Attachments</h2>
                    <div className="flex-col gap-sm">
                        {currentTicket.attachments.map((attachment, index) => (
                            <div key={index} className="flex-row gap-sm align-center">
                                <Icon name="document" />
                                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-secondary">
                                    {attachment.name}
                                </a>
                                <span className="text-sm text-placeholder">({attachment.type.toUpperCase()})</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const AnalyticsScreen = () => {
    return (
        <div className="container flex-col gap-lg">
            <h1 className="text-3xl font-bold" style={{ marginBottom: 'var(--spacing-md)' }}>Analytics & Reporting</h1>
            <div className="card flex-col gap-md">
                <h2 className="text-xl font-semibold">Historical Performance Trends</h2>
                <div className="chart-container" style={{ height: '300px' }}>Historical Line Chart (Tickets Over Time)</div>
                <div className="chart-container" style={{ height: '300px' }}>Historical Bar Chart (SLA Compliance)</div>
            </div>
            <div className="card flex-col gap-md">
                <h2 className="text-xl font-semibold">Export Options</h2>
                <div className="flex-row gap-md">
                    {hasPermission('canExportData') && (
                        <>
                            <button className="button button-primary"><Icon name="export" /> Export to PDF</button>
                            <button className="button button-primary"><Icon name="export" /> Export to Excel</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingsScreen = () => {
    return (
        <div className="container flex-col gap-lg">
            <h1 className="text-3xl font-bold" style={{ marginBottom: 'var(--spacing-md)' }}>Settings</h1>
            <div className="card flex-col gap-md">
                <h2 className="text-xl font-semibold">User Profile</h2>
                <form className="flex-col gap-md" onSubmit={(e) => { e.preventDefault(); alert('Profile Saved!'); }}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" className="input-field" value="Admin Client" readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <input type="text" id="role" className="input-field" value={currentUserRole} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" className="input-field" defaultValue="admin.client@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input type="password" id="password" className="input-field" placeholder="Enter new password (optional)" />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="button button-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function App() {
    const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });

    const navigateTo = (screen, params = {}) => {
        setView(prev => ({ // State immutability with functional update
            screen: screen,
            params: { ...params }
        }));
    };

    const getBreadcrumbsPath = () => {
        const path = [{ name: 'Dashboard', screen: 'DASHBOARD' }];
        if (view.screen === 'TICKETS') {
            path.push({ name: 'Tickets', screen: 'TICKETS' });
        } else if (view.screen === 'TICKET_DETAIL') {
            path.push({ name: 'Tickets', screen: 'TICKETS' });
            path.push({ name: view.params.ticketId || 'Detail', screen: 'TICKET_DETAIL', params: view.params });
        } else if (view.screen === 'ANALYTICS') {
            path.push({ name: 'Analytics', screen: 'ANALYTICS' });
        } else if (view.screen === 'SETTINGS') {
            path.push({ name: 'Settings', screen: 'SETTINGS' });
        }
        return path;
    };

    return (
        <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh' }}>
            <Header navigateTo={navigateTo} currentScreen={view.screen} />
            <Breadcrumbs path={getBreadcrumbsPath()} navigateTo={navigateTo} />
            <main>
                {view.screen === 'DASHBOARD' && <DashboardScreen navigateTo={navigateTo} />}
                {view.screen === 'TICKETS' && <TicketsScreen navigateTo={navigateTo} params={view.params} />}
                {view.screen === 'TICKET_DETAIL' && <TicketDetailScreen navigateTo={navigateTo} params={view.params} />}
                {view.screen === 'ANALYTICS' && <AnalyticsScreen navigateTo={navigateTo} />}
                {view.screen === 'SETTINGS' && <SettingsScreen navigateTo={navigateTo} />}
            </main>
        </div>
    );
}

export default App;