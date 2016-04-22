import React from 'react-native';
import _ from 'lodash';
const NavigationBar = require('react-native-navbar');
import Spinner from 'react-native-loading-spinner-overlay';

const {
    Component,
    View,
    Text,
    StyleSheet,
    TouchableHighlight
    } = React;

var GiftedListView = require('react-native-gifted-listview');
var GiftedSpinner = require('react-native-gifted-spinner');


export default class Unreads extends Component {

    constructor(props) {
        super(props);

        this.renderNone = this.renderNone.bind(this);
        this.renderUnreads = this.renderUnreads.bind(this);
        this.check = this.check.bind(this);
        this._onPress = this._onPress.bind(this);
    }

    componentDidMount() {

        //dont call getUnreads again if coming from login
        if(!this.props.route.passProps){
            this.props.getUnreads(this.props.user.token, true);
        }
    }

    renderNone() {
        const { user } = this.props;

        return (
            <View>
                <Text>Hey {user.unreads.user && user.unreads.user.name}, you have no unread messages. Lucky you.</Text>
            </View>
        )
    }

    renderUnreads() {
        const { user } = this.props;

        return (
            <View style={styles.container}>
                <View style={[styles.top,]}>
                    <Text>Hey {user.unreads.user && user.unreads.user.name}, you have {user.unreads.total} unread messages :)</Text>
                </View>
                <GiftedListView
                    rowView={this._renderRowView.bind(this)}
                    onFetch={this._onFetch.bind(this)}
                    firstLoader={true} // display a loader for the first fetching
                    pagination={true} // enable infinite scrolling using touch to load more
                    refreshable={true} // enable pull-to-refresh for iOS and touch-to-refresh for Android
                    renderSeparator={ (sectionID, rowID) => this._renderSeparatorView(sectionID, rowID) }
                    withSections={true} // enable sections
                    sectionHeaderView={this._renderSectionHeaderView.bind(this)}
                    customStyles={{
                        paginationView: {
                          backgroundColor: 'red',
                        },
                      }}
                    refreshableTintColor="blue"
                />
            </View>
        )
    }

    check() {

        const { user } = this.props;

        if(user.unreads && user.unreads.total > 0) {
            return this.renderUnreads()
        } else {
            return this.renderNone()
        }
    }

    /**
     * Will be called when refreshing
     * Should be replaced by your own logic
     * @param {number} page Requested page to fetch
     * @param {function} callback Should pass the rows
     * @param {object} options Inform if first load
     */
    _onFetch(page = 1, callback, options) {
        const { user } = this.props;

        let rows = {};
        let header;

        const format = (messages) => {
            _.forEach(messages, function (channelsArray, key) {

                console.log('channelsArray', channelsArray);

                if (!_.isEmpty(channelsArray)) {

                    _.each(channelsArray, channelObj => {
                        header = channelObj.name || 'ims';
                        rows[header] = _.map(channelObj.JakesMessages.messages, msg => {
                            return {
                                message: msg,
                                channelId: channelObj.id,
                                last_read: channelObj.last_read
                            }
                        })
                    });

                    //for Groups as the header
                    //header = _.capitalize(key);
                    //rows[header] = _.map(value, item => item);
                }
            });
            callback(rows);
        };

        if (options.firstLoad){

            format(user.unreads.messages)

        } else {

            this.props.getUnreads(this.props.user.token, false).then(() => format(user.unreads.messages))
        }
    }


    /**
     * When a row is touched
     * @param {object} rowData Row data
     */
    _onPress(channelId, ts) {
        console.log(channelId + ' pressed');

        this.props.markAsRead(this.props.user.token, channelId, ts).then(res => console.log('res', res))
    }


    /**
     * Render a row
     * @param {object} rowData Row data
     */
    _renderRowView(rowData) {
        console.log('rowData', rowData);
        return (
            <View
                style={styles.row}
                underlayColor='#c8c7cc'>
                <View>
                    <Text>{rowData.message.user} said {rowData.message.text}</Text>
                    <TouchableHighlight
                        onPress={() => this._onPress(rowData.channelId, rowData.last_read)}>
                        <Text>mark read</Text>

                    </TouchableHighlight>
                </View>
            </View>
        );
    }

    _renderSeparatorView(sectionID, rowID) {
        return (
            <View key={`${sectionID}-${rowID}`} style={ styles.separator }/>
        );
    }

    /**
     * Render a row
     * @param {object} rowData Row data
     */
    _renderSectionHeaderView(sectionData, sectionID) {
        return (
            <View style={styles.header} key={sectionID}>
                <Text style={styles.headerTitle}>
                    {sectionID}
                </Text>
            </View>
        );
    }


    render() {

        const leftButtonConfig = {
            title: 'Logout',
            handler: () => this.props.navigator.pop()
        };

        const Spinn = () => (
            <View style={styles.top}>
                <GiftedSpinner />
            </View>
        );

        return (
            <View style={styles.container}>
                <NavigationBar
                    title={{ title: 'Unreads', }}
                    rightButton={leftButtonConfig}/>
                {!this.props.user.unreads_loading ? this.check() : <Spinn/> }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //justifyContent: 'center',
        //alignItems: 'center',
        backgroundColor: 'lightyellow',
    },
    top: {
        flex: 0.25,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightyellow',
    },
    navBar: {
        height: 64,
        backgroundColor: '#CCC'
    },
    text: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    header: {
        backgroundColor: '#50a4ff',
        padding: 10,
    },
    headerTitle: {
        color: '#fff',
    },
    separator: {
        height: 11,
        backgroundColor: '#CCC'
    },
    row: {
        padding: 10,
        //height: 44,
    },
});
