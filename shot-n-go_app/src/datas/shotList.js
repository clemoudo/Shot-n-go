import tequilaSunriseImage from '../assets/tequilaSunriseImage.jpg'	
import b52Image from '../assets/b52Image.jpg'	
import kamikazeImage from '../assets/kamikazeImage.jpg'	
import jagerbImage from '../assets/jagerbImage.jpg'	
import blueLagoonImage from '../assets/blueLagoonImage.webp'	
import babyGuinnessImage from '../assets/babyGuinnessImage.webp'	

export const shotList = [
	{
		name: 'Tequila Sunrise',
		category: 'classique',
		id: '1ed',
		isBestSale: true,
		alcoholLevel: 3,
		sweetness: 2,
		cover: tequilaSunriseImage
	},
	{
		name: 'B52',
		category: 'classique',
		id: '2ab',
		alcoholLevel: 3,
		sweetness: 2,
		cover: b52Image
	},
	{
		name: 'Kamikaze',
		category: 'classique',
		id: '3sd',
		alcoholLevel: 3,
		sweetness: 1,
		cover: kamikazeImage
	},
	{
		name: 'Jäger',
		category: 'classique',
		id: '4kk',
		alcoholLevel: 3,
		sweetness: 1,
		cover: jagerbImage
	},
	{
		name: 'Blue Lagoon Shot',
		category: 'fruité',
		id: '5pl',
		alcoholLevel: 2,
		sweetness: 3,
		cover: blueLagoonImage
	},
	{
		name: 'Baby Guinness',
		category: 'crémeux',
		id: '7ie',
		isBestSale: true,
		alcoholLevel: 2,
		sweetness: 3,
		cover: babyGuinnessImage
	}
];