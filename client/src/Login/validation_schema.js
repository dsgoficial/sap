import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  usuario: Yup.string()
    .required('Preencha seu usuário'),
  senha: Yup.string()
    .required('Preencha sua senha')
})

export default validationSchema
