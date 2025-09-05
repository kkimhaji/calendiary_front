const ContentCard = ({ 
    title, 
    author, 
    date, 
    children, 
    onClick, 
    className = "" 
}) => {
    return (
        <div className={`content-card ${className}`} onClick={onClick}>
            <div className="content-header">
                <h3 className="content-title">{title}</h3>
            </div>
            <div className="content-body">
                {children}
            </div>
            <div className="content-meta">
                <span className="author">{author}</span>
                <span className="date">
                    {new Date(date).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

export default ContentCard;