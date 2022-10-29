#!/bin/bash
cat << EOF
         #------------------------------------------------------------------#
         #                                                                  #
         #                                                                  #
         #          A U T E N T I C A Ç Ã O  L D A P/S P E D                #
         #                                                                  #
         #                                                                  #
         #------------------------------------------------------------------#
- Antes de continuar certifique-se que o serviço LDAP do SPED está aberto.
nano /etc/default/slapd # Editar:
  #SLAPD_SERVICES="ldap://127.0.0.1:389/ ldaps:/// ldapi:///"
  SLAPD_SERVICES="ldap:/// ldapi:///"
service slapd restart

- Teste neste computador:
apt install ldap-utils
ldapsearch -H ldap://<IP_LDAP> -x -b dc=eb,dc=mil,dc=br

- Este programa executa as seguintes operações:
1) Configra a url, base_dn e admin_list do serviço LDAP usado na rede
2) Instala ldap-async@1.3.3 se não o houver
3) Renomeia o arquivo authenticate_user.js para date_authenticate_user.js
4) Recria o arquivo authenticate_user.js para usar o LDAP em vez do auth-server
EOF

porta='389'
base_dn='dc=eb,dc=mil,dc=br'
admin_list="['admin', 'capdiego']"

read -p "Digite o IP do seviço LDAP/SPED : " ip
read -p "Digite a porta do seviço LDAP/SPED [$porta]: " name
porta=${name:-$porta}
ldap_url='ldap://'$ip:$porta
read -p "Digite o BASE_DN [$base_dn]: " name
base_dn=${name:-$base_dn}
read -p "Digite a lista de logins administratores para acessa o Ferramentas de Gerência [ $admin_list ]: " name
admin_list=${name:-$admin_list}

template=$(cat << EOM
'use strict'

const Ldap = require('ldap-async').default
const { AppError, httpCode } = require('../utils')

const authorization = async function (usuario,senha,aplicacao){
  var userDN = 'cn='+usuario+',$base_dn';
  var ldap = new Ldap({
      url: '$ldap_url',
      bindDN: userDN,
      bindCredentials: senha,
    });
  try{
    var person = await ldap.get(userDN);
    if (aplicacao === 'sap_fg'){
        if ( $admin_list.includes(usuario) ){return true}
        else{return false}
    }else{
    return true
    }
  }catch(err){
    if (Object.keys(err).includes('lde_message')){
      return false
    }else{
      throw new AppError(
        'Erro ao se comunicar com o servidor LDAP do SPED-'+err.code
      );
    }
  }
}

module.exports = authorization
EOM
)
cd server
npm list | grep ldap-async || npm install ldap-async@1.3.3 --no-shrinkwrap
mv src/authentication/authenticate_user.js src/authentication/$(date +"%d-%m-%Y_%H-%M-%S")_authenticate_user.js
echo "$template" > src/authentication/authenticate_user.js
