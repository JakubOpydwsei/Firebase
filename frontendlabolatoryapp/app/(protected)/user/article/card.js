function ArticleCard({ article, index }) {
    const formattedDate = article.date.toDate().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
  return (
    <>
      <div key={index} className="m-3 card w-80 bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="card-body">
        <h2 className="card-title">{article.title}</h2>
        <p>{article.content}</p>
        <small>{formattedDate}</small>
      </div>
    </div>
    </>
  );
}

export default ArticleCard;
