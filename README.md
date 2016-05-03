##unslackd

![gif](http://jffileshares.s3.amazonaws.com/Screen-Recording-2016-04-25-01-03-14-zLhN0nFckf.gif)

--------------

### Client

Development:
cd client and
* run in xcode
* uncomment this line in AppDelegate.m `jsCodeLocation = [NSURL URLWithString:@"http://192.168.0.21:8081/index.ios.bundle?platform=ios"];` and
replace url with `localhost` (for **simulator**) or your ip address (for **running on your device**)

build for production ios:
```
react-native bundle --dev false --entry-file index.ios.js --bundle-output ios/main.jsbundle --platform iOS
```
comment this line in AppDelegate.m :
```
jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
```
and uncomment this one :

```
jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
```
Then you have to go for Product -> Archive in Xcode and follow the steps.

---------------

### API
cd api and run with `PORT=3000 nodemon`

---------------

### Website
Development:
cd website and `gulp serve`

Build
```
gulp build
```
Deploy
```
gulp s3
```
