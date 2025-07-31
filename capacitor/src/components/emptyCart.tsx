import './css/emptyCart.css';
export default function EmptyCart() {
  return (
    <div className="empty-state">
      <p id='head'>Din varukorg är tom</p>
      <p id='paragraph'>Skanna en vara för att lägga till den</p>
    </div>
  );
}
