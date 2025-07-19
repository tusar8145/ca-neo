 
import _ from '@lodash';
 
import  User  from '../auth/user/user';
import { changeFuseTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { selectUserSettings } from 'src/app/auth/user/store/userSlice';


function CommonTheme() {
    let user=User()
	let them=localStorage.getItem("theme");
	
 

	let primary_color='#ff0000'

	try {
		 primary_color=user?.hospital?.primary_color || '#ff0000'
	} catch (error) {
		
	}

	const userxx = useAppSelector(selectUserSettings);

    if(user.role == 'staff' || user.role == 'hospitalAssistant'){
		if(userxx?.layout?.style){
			console.log('1','gggg')
		}else{
			//need to apply
			const dispatch = useAppDispatch();

			let _theme={
						
				"id": "Emarald Gold",
				"section": {
					"main": {
						"palette": {
							"mode": "light",
							"primary": {
								"main": "#00695C",
								"light": "#439889",
								"dark": "#003D33",
								"contrastText": "rgb(255,255,255)"
							},
							"secondary": {
								"main": "#FFD740",
								"light": "#FFFF74",
								"dark": primary_color,
								"contrastText": "rgb(17, 24, 39)"
							},
							"background": {
								"default": "#dcf2f2",
								"paper": "#F2FDF4"
							},
							"text": {
								"primary": "rgb(17, 24, 39)",
								"secondary": "rgb(107, 114, 128)",
								"disabled": "rgb(149, 156, 169)"
							},
							"divider": "#b3c4c3"
						}
					},
					"navbar": {
						"palette": {
							"mode": "dark",
							"primary": {
								"main": "#00695C",
								"light": "#439889",
								"dark": "#003D33",
								"contrastText": "rgb(255,255,255)"
							},
							"secondary": {
								"main": "#FFD740",
								"light": "#FFFF74",
								"dark": primary_color,
								"contrastText": "rgb(17, 24, 39)"
							},
							"background": {
								"default": primary_color,
								"paper": "#00544a"
							},
							"text": {
								"primary": "rgb(255,255,255)",
								"secondary": "rgb(148, 163, 184)",
								"disabled": "rgb(156, 163, 175)"
							},
							"divider": "#2d6360"
						}
					},
					"toolbar": {
						"palette": {
							"mode": "light",
							"primary": {
								"main": "#00695C",
								"light": "#439889",
								"dark": "#003D33",
								"contrastText": "rgb(255,255,255)"
							},
							"secondary": {
								"main": "#FFD740",
								"light": "#FFFF74",
								"dark": primary_color,
								"contrastText": "rgb(17, 24, 39)"
							},
							"background": {
								"default": "#dcf2f2",
								"paper": "#F2FDF4"
							},
							"text": {
								"primary": "rgb(17, 24, 39)",
								"secondary": "rgb(107, 114, 128)",
								"disabled": "rgb(149, 156, 169)"
							},
							"divider": "#b3c4c3"
						}
					},
					"footer": {
						"palette": {
							"mode": "dark",
							"primary": {
								"main": "#00695C",
								"light": "#439889",
								"dark": "#003D33",
								"contrastText": "rgb(255,255,255)"
							},
							"secondary": {
								"main": "#FFD740",
								"light": "#FFFF74",
								"dark": primary_color,
								"contrastText": "rgb(17, 24, 39)"
							},
							"background": {
								"default": primary_color,
								"paper": "#00544a"
							},
							"text": {
								"primary": "rgb(255,255,255)",
								"secondary": "rgb(148, 163, 184)",
								"disabled": "rgb(156, 163, 175)"
							},
							"divider": "#2d6360"
						}
					}
				}
			
			}
	
			dispatch(changeFuseTheme(_theme?.section)).then(() => { });
			console.log('2','gggg')
		}
	}

	return (
	 <></>
	);
}

export default CommonTheme;
