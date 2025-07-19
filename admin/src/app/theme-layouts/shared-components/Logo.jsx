import { styled } from '@mui/material/styles';
import { useTheme } from '../../context/ThemeContext';
import '../../../styles/custom-basic.css';
import {  useEffect, useState } from 'react';

const Root = styled('div')(({ theme }) => ({
	'& > .logo-icon': {
		transition: theme.transitions.create(['width', 'height'], {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	},
	'& > .badge': {
		transition: theme.transitions.create('opacity', {
			duration: theme.transitions.duration.shortest,
			easing: theme.transitions.easing.easeInOut
		})
	}
}));

/**
 * The logo component.
 */
function Logo() {
	const [size, setSize] = useState({});
	const [width, setWidth] = useState('100%');

	const { hospital, toggleHospital, refreshHospital, toggleRefreshHospital} = useTheme();

	useEffect(() => {
		let ratio = size.width/size.height

			 if(ratio>0 && ratio<=0.5){setWidth('25%')}
		else if(ratio>0.5 && ratio<=1){setWidth('35%')}
		else if(ratio>1 && ratio<=1.5){setWidth('45%')}
		else if(ratio>1.5 && ratio<=2){setWidth('55%')}
		else if(ratio>2 && ratio<=2.5){setWidth('65%')}
		else if(ratio>2.5 && ratio<=3){setWidth('75%')}
		else if(ratio>3 && ratio<=3.5){setWidth('85%')}
		else if(ratio>3.5 && ratio<=4){setWidth('100%')}
		else{setWidth('100%')}

	}, [size]);

	return (
		<Root className="flex items-center">
			{hospital?.logo &&
				<div className=''>
					 
					<img
						className="logo-icon logo_img"
						style={{width:width}}
						src={hospital?.logo}
						alt="logo"
						onLoad={event => {
							setSize({
							  height: event.target.naturalHeight,
							  width: event.target.naturalWidth
							});
						  }}
					/>	
	 {/*size?.height && size?.width && (
        <span>
          {size.height} x {size.width}
        </span>
      )*/}		
				</div>
			}

			{/*<div className="flex space-x-6 px-8 items-center">
				<div
					className="badge flex items-end justify-end rounded-4 w-24 h-24 px-3"
					style={{
						backgroundColor: '#2e79c7',
						color: '#ffffff'
					}}
				>
					<span className="react-text text-12 font-semibold">TS</span>
				</div>
				<div
					className="badge flex items-end justify-end rounded-4 w-24 h-24 px-3"
					style={{
						backgroundColor: '#f0dc4e',
						color: '#2f2f2c'
					}}
				>
					<span className="react-text text-12 font-semibold">JS</span>
				</div>
				<div
					className="badge flex items-center rounded-4 space-x-8 px-8 py-4"
					style={{
						backgroundColor: '#23272f',
						color: '#149eca'
					}}
				>
					<img
						className="react-badge"
						src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xMS41IC0xMC4yMzE3NCAyMyAyMC40NjM0OCI+CiAgPHRpdGxlPlJlYWN0IExvZ288L3RpdGxlPgogIDxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSIyLjA1IiBmaWxsPSIjNjFkYWZiIi8+CiAgPGcgc3Ryb2tlPSIjNjFkYWZiIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIi8+CiAgICA8ZWxsaXBzZSByeD0iMTEiIHJ5PSI0LjIiIHRyYW5zZm9ybT0icm90YXRlKDYwKSIvPgogICAgPGVsbGlwc2Ugcng9IjExIiByeT0iNC4yIiB0cmFuc2Zvcm09InJvdGF0ZSgxMjApIi8+CiAgPC9nPgo8L3N2Zz4K"
						alt="react"
						width="16"
					/>
					<span className="react-text text-12 font-semibold">React</span>
				</div>
				</div>*/}
		</Root>
	);
}

export default Logo;
