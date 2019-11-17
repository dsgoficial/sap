/**
 * @api {post} /login Autenticação de um usuário
 * @apiGroup Login
 *
 * @apiParam (Request body) {String} usuario Usuário conforme acesso ao banco de dados de produção
 * @apiParam (Request body) {String} senha Senha conforme acesso ao banco de dados de produção
 *
 * @apiSuccess {String} token JWT Token for authentication.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Authentication success",
 *       "token": "eyJhbGciOiJIUzI1NiIsIn..."
 *     }
 *
 * @apiError JsonValidationError O objeto json não segue o padrão estabelecido.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "message": "Login Post validation error"
 *     }
 *
 * @apiError AuthenticationError Usuário ou senha inválidas.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "success": false,
 *       "message": "Falha durante autenticação"
 *     }
 */
