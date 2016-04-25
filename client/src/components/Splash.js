
import React, {
    Component,
    PropTypes,
    StyleSheet,
    Text,
    View,
    Linking,
    TouchableHighlight,
    AlertIOS
} from 'react-native';

import {getParameterByName} from '../utils/helpers'
import Button from 'apsl-react-native-button'
import Unreads from '../components/Unreads'

class Splash extends Component {

    constructor(props) {
        super(props);
        this.doAuth = this.doAuth.bind(this);
        this.authCallback = this.authCallback.bind(this);
    }

    authCallback(err, token) {
        var { setToken, authSlack, navigator } = this.props;

        if (err) {
            console.warn(err)
        }
        setToken(token);
        authSlack(token).then(() => navigator.push({component: Unreads, passProps: {authed: true}}))
    }

    doAuth(cb) {

        const auth_state = Math.random() + '';

        function handleUrl(event) {
            var stateQ = getParameterByName('state', event.url);
            var code = getParameterByName('code', event.url);

            if (auth_state === stateQ) {
                cb(null, code)
            } else {
                cb(new Error('Oauth2 security error'))
            }
            Linking.removeEventListener('url', handleUrl)
        }

        Linking.addEventListener('url', handleUrl);

        const url = ([
            'https://slack.com/oauth/authorize',
            '?client_id=2165302478.32002522884',
            '&scope=client',
            '&state=' + auth_state,
            '&redirect_uri=unslackd://foo'
        ].join(''));

        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + url);
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => console.warn('An error occurred during Linking.canOpenURL', err));
    }

    render() {

        return (
            <View style={styles.container}>
                <View>
                    <Text style={styles.text}>Hello</Text>
                </View>
                <Button style={styles.buttonStyle7}
                        textStyle={styles.textStyle8}
                        onPress={() => this.doAuth(this.authCallback)}>
                    Login
                </Button>
            </View>
        );
    }
}

Splash.propTypes = {
    user: PropTypes.object.isRequired,
    setToken: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightblue',
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    buttonStyle7: {
        borderColor: '#8e44ad',
        backgroundColor: 'white',
        borderRadius: 0,
        borderWidth: 3,
        width: 200,
        alignSelf: 'center',
    },
    textStyle8: {
        fontFamily: 'Avenir Next',
        fontWeight: '500',
        color: '#333',
    }
});

export default Splash;