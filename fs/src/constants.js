import {Person, Speedometer2, BoxArrowDownRight, Receipt} from 'react-bootstrap-icons'
const SIDEBAR_NAVIGATION = [
        'dashboard' ,
         'customer',
        'staff',
        'billings',
        


]

const ICONS = {
    'staff' : 'bi bi-person-badge',
    'customer' : 'bi bi-people',
    'dashboard' : 'bi bi-speedometer2' ,
    'billings' : 'bi bi-receipt' 

}

export {
    SIDEBAR_NAVIGATION, 
    ICONS
}