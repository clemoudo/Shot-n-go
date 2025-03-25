import tequilaSunriseImage from '../assets/shots/tequilaSunriseImage.jpg'
import b52Image from '../assets/shots/b52Image.jpg'
import kamikazeImage from '../assets/shots/kamikazeImage.jpg'
import jagerImage from '../assets/shots/jagerImage.jpg'
import babyGuinnessImage from '../assets/shots/babyGuinnessImage.webp'

export const shotList = [
	{
		name: 'Tequila Sunrise',
		category: 'classique',
		id: '1ed',
		isBestSale: true,
		alcoholLevel: 3,
		sweetness: 2,
		cover: tequilaSunriseImage,
		price: 2.00
	},
	{
		name: 'B52',
		category: 'classique',
		id: '2ab',
		alcoholLevel: 3,
		sweetness: 2,
		cover: b52Image,
		price: 2.00
	},
	{
		name: 'Kamikaze',
		category: 'classique',
		id: '3sd',
		alcoholLevel: 3,
		sweetness: 1,
		cover: kamikazeImage,
		price: 2.00
	},
	{
		name: 'Jäger',
		category: 'classique',
		id: '4kk',
		alcoholLevel: 3,
		sweetness: 1,
		cover: jagerImage,
		price: 2.00
	},
	{
		name: 'Baby Guinness',
		category: 'crémeux',
		id: '7ie',
		isBestSale: true,
		alcoholLevel: 2,
		sweetness: 3,
		cover: babyGuinnessImage,
		price: 2.00
	}
];