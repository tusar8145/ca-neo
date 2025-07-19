import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import FuseLoading from '@fuse/core/FuseLoading';
import Button from '@mui/material/Button';
import CIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
 

/**
 * The CenterItems widget.
 */
function CenterItems(props) {
	const { t } = useTranslation('shared-components');
	return (
        <div className="flex flex-col items-center justify-center  mx-auto w-full">


            {props.icon == 1 &&

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0 } }}
                >
                    <Typography
                        color="inherit"
                        className="text-18 font-semibold"
                    >
                        <FuseSvgIcon className="text-48 mt-128" size={48} color="action">material-outline:error_outline</FuseSvgIcon>
                    </Typography>
                </motion.div>
            }


            {props.text &&
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0 } }}
                >
                    <Typography className="mt-4 text-32 sm:text-48 font-extrabold tracking-tight leading-tight text-center">
                        {props.text}
                    </Typography>
                </motion.div>
            }

            {props.text1 &&

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.3 } }}
                >
                    <Typography
                        color="text.secondary"
                        className="mt-12 sm:text-20 text-center tracking-tight"
                    >
                        {props.text1}
                    </Typography>
                </motion.div>
            }

        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
        >

        </motion.div>
    </div>
	);
}

export default memo(CenterItems);
