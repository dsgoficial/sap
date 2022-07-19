import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    LinearProgress,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    FormHelperText
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAPI } from '../../contexts/apiContext'

const validationSchema = yup.object({
    tipo_problema_id: yup
        .number('Escolha o tipo de problema')
        .required('Campo obrigatório'),
    descricao: yup
        .string('Descreva o problema')
        .required('Campo obrigatório'),
});

export default function ReportErrorForm({ open, setOpen, onSubmit }) {

    const { getErrorTypes } = useAPI()

    const [errorTypes, setErrorTypes] = React.useState([]);

    useEffect(() => {
        loadErrorTypes()
    }, []);

    const loadErrorTypes = async () => {
        let data = await getErrorTypes()
        if (!data) return
        setErrorTypes(data.dados)
    }

    const handleClose = () => {
        setOpen(false);
    };

    const formik = useFormik({
        initialValues: {
            tipo_problema_id: '',
            descricao: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            handleClose()
            onSubmit(values);
        },
    });

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Reportar Problema</DialogTitle>
            <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            paddingRight: 1.7,
                            '& > :not(style)': {
                                m: 1
                            },
                        }}
                    >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label" >Tipo Problema</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={formik.values.tipo_problema_id}
                                label="tipo_problema_id"
                                name="tipo_problema_id"
                                onChange={formik.handleChange}
                                error={formik.touched.tipo_problema_id && Boolean(formik.errors.tipo_problema_id)}
                            >
                                {
                                    errorTypes.map(item => {
                                        return <MenuItem
                                            key={item.tipo_problema_id}
                                            value={item.tipo_problema_id}
                                        >
                                            {item.tipo_problema}
                                        </MenuItem>
                                    })
                                }
                            </Select>
                            <FormHelperText
                                error={formik.touched.tipo_problema_id && Boolean(formik.errors.tipo_problema_id)}
                            >{
                                    formik.touched.tipo_problema_id &&
                                    formik.errors.tipo_problema_id}
                            </FormHelperText>
                        </FormControl>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            id="descricao"
                            name="descricao"
                            label="Descrição"
                            value={formik.values.descricao}
                            onChange={formik.handleChange}
                            error={formik.touched.descricao && Boolean(formik.errors.descricao)}
                            helperText={formik.touched.descricao && formik.errors.descricao}
                        />
                        <Button color="primary" variant="contained" fullWidth type="submit">
                            Enviar
                        </Button>
                    </Box>
                </form>
            </DialogContent>
        </Dialog>
    );
}
