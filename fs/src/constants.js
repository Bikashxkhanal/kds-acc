import {Person, Speedometer2, BoxArrowDownRight, Receipt} from 'react-bootstrap-icons'
const SIDEBAR_NAVIGATION = [
        'dashboard' ,
         'customer',
        'sales',
        'purchases',
        'staff',
        'billings',
        'activity',
        'users',
    
]

const ICONS = {
    'staff' : 'bi bi-person-badge',
    'customer' : 'bi bi-people',
    'dashboard' : 'bi bi-speedometer2' ,
    'billings' : 'bi bi-receipt', 'activity': 'bi bi-clock-history', 'users': 'bi bi-person-gear'
    ,'sales': 'bi bi-graph-up-arrow', 'purchases': 'bi bi-bag-check'

}

const LINKS = {
    'dashboard' : '/',
    'customer' : '/customers',
    'staff' : '/staff',
    'billings' : '/billings'
    ,'sales': '/sales', 'purchases': '/purchases', 'activity': '/activity-log', 'users': '/users'
}

export {
    SIDEBAR_NAVIGATION, 
    ICONS,
    LINKS
}
