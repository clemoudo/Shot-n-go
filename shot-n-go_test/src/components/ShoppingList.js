const shotList = [
   'tequila',
   'vodka',
   'pisang',
   'jägermeister',
   'rhum'
]

function ShoppingList() {
   return (
       <ul>
           {shotList.map((shot, i) => (
               <li key={`${shot}-${i}`}>{shot}</li>
           ))}
       </ul>
   )
}

export default ShoppingList
