require('react-native-browser-polyfill');
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Root from '../components/Root';
import * as AuthActions from '../actions/user';
import * as AppActions from '../actions/app';

function mapStateToProps(state) {
    return {
        user: state.user,
        app: state.app
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(Object.assign({}, AuthActions, AppActions), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Root);
