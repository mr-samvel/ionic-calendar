Teste de calendario.

  Requisitos:
 - Necessario ter o NodeJS instalado (para ter o npm): https://www.npmjs.com/get-npm;
 - Necessario ter o cordova e o ionic 4 instalados: https://ionicframework.com/docs/v1/guide/installation.html (nao é necessario criar um projeto em branco);

  Opcional:
 - Ter o Android Studio instalado e configurado para emular: https://stackoverflow.com/questions/42711120/how-do-i-run-an-ionic-app-in-android-studio-emulator;
 - Se estiver em um MacOS é possivel usar o XCode para emular um dispositivo iOS: https://ionicframework.com/docs/building/ios;
 
  Com o projeto do git clonado, navegar ate a pasta local do projeto e rodar "npm install" para que todas as dependencias listadas no package.json sejam instaladas.
    
  Para rodar o projeto no navegador, na pasta do projeto executar "ionic serve".
  
  Para rodar no android, "ionic platform add android" da primeira vez, e entao "ionic run android". Esse ultimo comando instala e executa o aplicativo compilado no emulador ou no seu celular (para configura-lo ver a primeira resposta: https://forum.ionicframework.com/t/testing-your-application-on-real-devices/7122).
  
  Para rodar no iOS, "ionic platform add iOS" da primeira vez, e entao "ionic cordova run ios".
