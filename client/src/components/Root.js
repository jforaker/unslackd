
const store = require('react-native-simple-store');
import LoadingView from './LoadingView.js'

import React, {
    Component,
    PropTypes,
    StyleSheet,
    Text,
    View,
    Navigator,
    TouchableHighlight,
} from 'react-native';

import Flash from './Flash'
import Splash from './Splash'
import Unreads from '../components/Unreads'

export default class Root extends Component {

    constructor(props) {
        super(props);
        this.renderScene = this.renderScene.bind(this);
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

    render() {

        const splash = {component: Splash};
        const unreads = {component: Unreads};
        const init = !this.props.user.logged_in ? splash : unreads;

        if (!this.props.app.loaded) {
            return <LoadingView />
        }

        if (this.props.user.show_flash) {
            return <Flash shouldShow={this.props.user.show_flash} {...this.props} />
        }

        return (
            <Navigator
                initialRoute={init}
                renderScene={this.renderScene}
            />
        );
    }
}
