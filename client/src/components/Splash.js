
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

import Button from 'apsl-react-native-button'

import Unreads from '../components/Unreads'

class Splash extends Component {

    constructor(props) {
        super(props);
        this.doAuth = this.doAuth.bind(this);
    }

    doAuth() {

        var { setToken, authSlack, navigator } = this.props;

        const authorize = (callback) => {

            const state = Math.random() + '';

            Linking.addEventListener('url', handleUrl);

            function getParameterByName(name, url) {
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            }

            function handleUrl(event) {
                var stateQ = getParameterByName('state', event.url);
                var code = getParameterByName('code', event.url);

                if (state === stateQ) {
                    callback(null, code)
                } else {
                    callback(new Error('Oauth2 security error'))
                }
                Linking.removeEventListener('url', handleUrl)
            }

            const url = ([
                'https://slack.com/oauth/authorize',
                '?client_id=2165302478.32002522884',
                '&scope=client',
                '&state=' + state,
                '&redirect_uri=unslackd://foo'
            ].join(''));

            Linking.canOpenURL(url).then(supported => {
                if (!supported) {
                    console.log('Can\'t handle url: ' + url);
                } else {
                    return Linking.openURL(url);
                }
            }).catch(err => console.warn('An error occurred', err));
        };

        authorize((err, access_token) => {
            if (err) {
                console.warn(err)
            }
            setToken(access_token);
            return authSlack(access_token).then(() => navigator.push({component: Unreads, passProps:{authed:true}}))
        });
    }

    render() {
        const { user } = this.props;

        return (
            <View style={styles.container}>
                <View>
                    <Text style={styles.text}>Hello</Text>
                </View>
                <Button style={styles.buttonStyle7} textStyle={styles.textStyle8} onPress={() => this.doAuth()}>
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