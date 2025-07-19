import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
 
import { z } from 'zod';
import _ from '@lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import useJwtAuth from '../useJwtAuth';
import * as React from 'react';
import Alert from '@mui/material/Alert';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

/**
 * Form Validation Schema
 */
const schema = z.object({
	email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
	password: z
		.string()
		.min(4, 'Password is too short - must be at least 4 chars.')
		.nonempty('Please enter your password.')
});
const defaultValues = {
	email: '',
	password: '',
	remember: true
};

function JwtSignInForm() {
	localStorage.removeItem("theme");

	const { t } = useTranslation('shared-components');
	const [alert, setAlert] = useState(false);
	const { signIn } = useJwtAuth();
	const { control, formState, handleSubmit, setValue, setError } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});
	const { isValid, dirtyFields, errors } = formState;
	useEffect(() => {
		//setValue('email', 'admin@dpc-management.com', { shouldDirty: true, shouldValidate: true });
		//setValue('password', '12345678Ss.', { shouldDirty: true, shouldValidate: true });
	}, [setValue]);

	async function onSubmit(formData) {
		const { email, password } = formData;
		setAlert(false)
		
		let x= await signIn({
			email,
			password
		}).catch((error) => {
			
			const errorData = error.response.data;
			errorData.forEach((err) => {
				setError(err.type, {
					type: 'manual',
					message: err.message
				});
			});
		});

		if(x.message=='Request failed with status code 404'){
			setAlert(true)
		} 
	}

	return (
		<>

		<form
			name="loginForm"
			noValidate
			className="mt-32 flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>






			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Email"
						autoFocus
						type="email"
						error={!!errors.email}
						helperText={errors?.email?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>

			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Password"
						type="password"
						error={!!errors.password}
						helperText={errors?.password?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>

			<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
				<Controller
					name="remember"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label="Remember me"
								control={
									<Checkbox
										size="small"
										{...field}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				{/*<Link
					className="text-md font-medium"
					to="/pages/auth/forgot-password"
				>
					Forgot password?
				</Link>*/}
			</div>

			<Button
				variant="contained"
				className=" mt-16 w-full bg-[#0A2E52BF] hover:bg-[#0A2E52] text-white"
				aria-label="Sign in"
				disabled={_.isEmpty(dirtyFields) || !isValid}
				type="submit"
				size="large"
			>
				Sign in
			</Button>
		</form>

{alert==true &&

		<Alert variant="outlined" severity="error" className='mt-24'>
           {t('Email or password not match')}
       </Alert>
}

		
		</>
	);
}

export default JwtSignInForm;
