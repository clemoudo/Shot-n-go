import Sweetness from '../assets/sweetness.svg'
import AlcoholLevel from '../assets/alcoholLevel.svg'

// Ici, il s'agit d'une manière de faire.
//Vous auriez aussi pu utiliser une fonction qui retourne l'élément souhaité, ou bien faire directement des conditions
const quantityLabel = {
	1: 'peu',
	2: 'une quantité modérée',
	3: 'beaucoup'
}

function TasteScale({ scaleValue, tasteType }) {
	const range = [1, 2, 3]
	const scaleType =
		tasteType === 'sweetness' ? (
			<img src={Sweetness} alt='sweetness-icon' />
		) : (
			<img src={AlcoholLevel} alt='alcoholLevel-icon' />
		)

	return (
		<div
			onClick={() =>
				alert(
					`Ce shot contient ${quantityLabel[scaleValue]} ${
						tasteType === 'sweetness' ? 'de sucre' : "d'alcool"
					}`
				)
			}
		>
			{range.map((rangeElem) =>
				scaleValue >= rangeElem ? (
					<span key={rangeElem.toString()}>{scaleType}</span>
				) : null
			)}
		</div>
	)
}

export default TasteScale