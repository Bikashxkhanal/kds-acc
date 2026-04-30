import ResponsivePagination from 'react-responsive-pagination'
import 'react-responsive-pagination/themes/classic-light-dark.css';

const PaginationBar = ({
    current = 1, 
    total = 1, 
    onPageChange, 
    className
}) => {
    return (
       <div className={`absolute bottom-4 ${className}`} >
        <ResponsivePagination
            current={current}
            total={total}
            onPageChange={onPageChange}
            />
        </div>  
    )
}


export default PaginationBar