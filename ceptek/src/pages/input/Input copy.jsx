// @ts-nocheck


import { Button, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useForm } from "react-hook-form"
import { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
const data = [
    {
        value: "iphone",
        lable: "iphone",
    },
    {
        value: "samsung",
        lable: "samsung",
    },
    {
        value: "redmi",
        lable: "redmi",
    }
]



export function Input() {
    const [open, setOpen] = useState(false);
   




    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };


    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm()

    const onSubmit = (data) => handleClick()

    return (
        <Box
            onSubmit={handleSubmit(onSubmit)}
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            noValidate
            autoComplete="off"
        >

            <Select
                defaultValue={"iphone"}
                variant="filled"
            >
                {data.map((item) => {
                    return (
                        <MenuItem key={item.value} value={item.value} >
                            {item.lable}
                        </MenuItem>
                    )
                })}
            </Select>



            <TextField
                {...register("parça", { required: true, minLength: 3 })}
                helperText={errors.parça ? "eksik veri" : null}
                error={errors.parça}
                label="parça" variant="filled" />

            <TextField
                {...register("kalite", { required: true, minLength: 3 })}
                helperText={errors.kalite ? "eksik veri" : null}
                error={errors.kalite}
                label="kalite" variant="filled" />

            <TextField

                {...register("marka", { required: true, minLength: 3 })}
                helperText={errors.marka ? "eksik veri" : null}
                error={errors.marka}
                label="marka" variant="filled" />

            <TextField
                {...register("adet", { required: true, minLength: 3 })}
                helperText={errors.adet ? "eksik veri" : null}
                error={errors.adet}
                label="adet" variant="filled" />

            <TextField
                {...register("fiyat", { required: true, minLength: 3 })}
                helperText={errors.fiyat ? "eksik veri" : null}
                error={errors.fiyat}
                label="fiyat" variant="filled" />

            <Box textAlign={"right"}>
                <Button

                    type='submit' sx={{ textTransform: "capitalize" }}>
                    create new user
                </Button>

                <Snackbar
                    anchorOrigin={{ vertical :"bottom", horizontal :"center" }}
                    
                    open={open}
                    open={open} autoHideDuration={6000} onClose={handleClose}>
                    <Alert
                        onClose={handleClose}
                        severity="info"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        başaryla gönderildi
                    </Alert>
                </Snackbar>


            </Box>


        </Box>
    )
}