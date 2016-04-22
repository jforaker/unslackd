
import Spinner from 'react-native-loading-spinner-overlay';
const GiftedSpinner = require('react-native-gifted-spinner');
const NavigationBar = require('react-native-navbar');
const store = require('react-native-simple-store');

import React, {
    Component,
    PropTypes,
    StyleSheet,
    Text,
    View,
    Navigator,
    TouchableHighlight,
} from 'react-native';

import Splash from './Splash'
import Unreads from '../components/Unreads'

export default class Root extends Component {

    constructor(props) {
        super(props);
        this.renderScene = this.renderScene.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
    }

    componentWillMount() {
        //store.delete('token');
        store.get('token').then((token) => {
            if (token) {
                this.props.setToken(token);
            }
            this.props.setLoaded(true);
        });
    }

    renderScene(route, navigator) {
        const Component = route.component;
        return (
            <Component navigator={navigator} route={route} {...this.props} />
        )
    }

    renderLoading() {
        return (
            <View style={styles.container}>
                <View style={styles.top}>
                    <GiftedSpinner />
                </View>
            </View>
        )
    }

    render() {

        if (!this.props.app.loaded) {
            return this.renderLoading()

        } else {
            const login = {component: Splash};
            const unreads = {component: Unreads};
            const init = !this.props.user.logged_in ? login : unreads;

            return (
                <Navigator
                    initialRoute={init}
                    renderScene={this.renderScene}
                />
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightyellow',
    },
    top: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightyellow',
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});
