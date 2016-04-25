import React from 'react-native';
import _ from 'lodash';
const NavigationBar = require('react-native-navbar');
const RefreshableListView = require('react-native-refreshable-listview');

import EmptyView from './EmptyView.js'
import LoadingView from './LoadingView.js'
import Splash from './Splash'
import MessageCell from './MessageCell'
const xBtn = require('../../assets/close.png');

const {
    Component,
    View,
    Text,
    StyleSheet,
    TouchableHighlight,
    ListView,
    Image
    } = React;

let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2, sectionHeaderHasChanged: (s1, s2) => s1 !== s2});

export default class Unreads extends Component {

    constructor(props) {
        super(props);
        this.dataSource = ds;
        this.renderMessageCell = this.renderMessageCell.bind(this);
        this.renderSectionHeaderView = this.renderSectionHeaderView.bind(this);
        this.renderSeparatorView = this.renderSeparatorView.bind(this);
        this.checkTotalAndRender = this.checkTotalAndRender.bind(this);
        this.onPress = this.onPress.bind(this);
        this.createRowsWithHeaders = this.createRowsWithHeaders.bind(this);
        this.refreshList = this.refreshList.bind(this)
    }

    componentDidMount() {
        //dont call getUnreads again if coming from login
        if(!this.props.route.passProps){
            this.props.getUnreads(this.props.user.token, true);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.user.logged_in && nextProps.user.logging_out) {
            this.props.navigator.replace({
                component: Splash,
                passProps: {authed: false}
            })
        }
    }

    refreshList(showLoader) {
        this.props.getUnreads(this.props.user.token, showLoader);
    }

    onPress(channelId, ts, rowData) {
        const { user } = this.props;
        this.props.markAsRead(user.token, channelId, ts, user.unreads, rowData);
    }

    renderMessageCell(message) {
        return (
            <MessageCell key={message.ts} message={message} _onPress={this.onPress}/>
        )
    }

    createRowsWithHeaders(data) {
        let dataBlob = {};

        if (data && !_.isEmpty(data)) {
            _.each(data.messages, (val, key) => {
                _.each(val, channelObj => {
                    if (channelObj.JakesMessages.messages.length) {
                        const messages = _.map(channelObj.JakesMessages.messages, msg => {
                            const from = _.find(data.users, {id: msg.user});
                            return {
                                message: msg,
                                channelId: channelObj.id,
                                ts: msg.ts,
                                type: key,
                                from: from
                            }
                        });
                        const header = channelObj.name || `dm from ${_.find(data.users, {id: channelObj.user}).name}`;
                        dataBlob[header] = _.orderBy(messages, ['ts'], ['asc']);
                    }
                });
            })
        }
        return dataBlob
    }

    renderSeparatorView(sectionID, rowID) {
        return (
            <View key={`${sectionID}-${rowID}`} style={ styles.separator }/>
        );
    }

    renderSectionHeaderView(sectionData, sectionID) {
        const { markAsRead, user } = this.props;
        const last = _.last(sectionData);

        return (
            <View style={styles.header} key={sectionID}>
                <Text style={[styles.headerTitle]}>
                    {sectionID}
                </Text>
                <TouchableHighlight onPress={() => markAsRead(user.token, last.channelId, last.message.ts, user.unreads, last)}>
                    <Text style={{color:'white'}}>
                        mark all
                    </Text>
                </TouchableHighlight>
            </View>
        );
    }

    checkTotalAndRender() {
        const { user, getUnreads } = this.props;
        const dataSource = this.dataSource.cloneWithRowsAndSections(this.createRowsWithHeaders(user.unreads));

        if (user.unreads && user.unreads.total > 0) {
            return (
                <View style={styles.container}>

                    <View style={[styles.top]}>
                        <Text style={styles.topText}>
                            <Text>Hey {user.unreads.user && user.unreads.user.name},
                                <Text style={styles.boldText}> you have {user.unreads.total} unread messages </Text>
                                :)
                            </Text>
                        </Text>
                        {user.unreads_refreshing && <Text style={styles.topText}>refreshing...</Text>}
                    </View>

                    <RefreshableListView
                        hasData={user.unreads.total > 0}
                        dataSource={dataSource}
                        renderRow={this.renderMessageCell}
                        renderSectionHeader={this.renderSectionHeaderView}
                        renderSeparator={(sectionID, rowID) => this.renderSeparatorView(sectionID, rowID)}
                        isRefreshing={user.unreads_loading}
                        loadData={() => getUnreads(user.token, false)}
                        refreshDescription="Refreshing messages"
                    />
                </View>
            )
        } else {
            return <EmptyView {...this.props} />
        }
    }

    render() {

        const rightButton = {
            title: 'Logout',
            handler: () => this.props.doLogout()
        };

        if (this.props.user.unreads_loading) {
            return <LoadingView />
        }

        return (
            <View style={styles.container}>
                <NavigationBar
                    title={{title: 'unslackd'}}
                    rightButton={rightButton}/>
                {this.checkTotalAndRender()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    top: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightgrey',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 20
    },
    separator: {
        height: 1,
        backgroundColor: '#CCCCCC',
    },
    header: {
        backgroundColor: '#254C87',
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        alignSelf: 'flex-end',
        flex: 1,
    },
    topText: {
        fontSize: 14,
        textAlign: 'center',
        color: '#A9A9A9',
    },
    boldText: {
        fontWeight: 'bold',
    },
});
