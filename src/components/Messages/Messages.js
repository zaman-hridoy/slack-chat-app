import React, { Component, Fragment } from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions/index.js';

import MessagesHeader from './MessagesHeader.js';
import MessageForm from './MessageForm.js';
import Message from './Message.js';
import Typing from './Typing.js';
import Skeleton from './Skeleton.js';

class Messages extends Component {

    state = {
        isPrivate: this.props.isPrivate,
        messagesRef: firebase.database().ref('messages'),
        privateMessagesRef: firebase.database().ref('privateMessages'),
        channel: this.props.currentChannel,
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        connectedRef: firebase.database().ref('.info/connected'),
        user: this.props.currentUser,
        messages: [],
        numOfUniqueUsers: '',
        searchTern: '',
        searchResult: [],
        typingUsers: [],
        searchLoading: false,
        isChannelstarred: false,
        messagesLoading: true,
        listeners: []
    }

    componentDidMount() {
        const { channel, user } = this.state;

        if(channel && user) {
            this.removeListerners(this.state.listeners);
            this.addListener(channel.id);
            this.addUserStarListener(channel.id, user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListerners(this.state.listeners);
        this.state.connectedRef.off();
    }

    removeListerners = listeners => {
        listeners.forEach(listener => {
            listener.ref.child(listener.id).off(listener.event);
        })
    }

    removeListerner = () => {
        this.state.userRef.child(`${this.state.user.uid}/color`).off();
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.messagesEnd) {
            this.scrollToBottom();
        }
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: "smooth"});
    }

    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event;
        });

        if(index === -1) {
            const newListener = {id, ref, event};
            this.setState({
                listeners: this.state.listeners.concat(newListener)
            })
        }
    }

    addUserStarListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null) {
                    const channelIds = Object.keys(data.val());
                    const prevStarred = channelIds.includes(channelId);
                    this.setState({ isChannelstarred: prevStarred })
                }
            })
    }

    addListener = channelId => {
        this.addMessageListener(channelId);
        this.addTypingListerners(channelId)
    }

    addTypingListerners = channelId => {
        let typingUsers = [];
        this.state.typingRef.child(channelId).on('child_added', snap => {
            if(snap.key !== this.state.user.uid) {
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                });
                this.setState({ typingUsers })
            }
        });

        this.addToListeners(channelId, this.state.typingRef, 'child_added');

        this.state.typingRef.child(channelId).on('child_removed', snap => {
            const index = typingUsers.findIndex(user => user.id === snap.key);
            if(index !== -1) {
                typingUsers = typingUsers.filter(user => user.id !== snap.key);
                this.setState({ typingUsers });
            }
        })

        this.addToListeners(channelId, this.state.typingRef, 'child_removed');


        this.state.connectedRef.on('value', snap => {
            if(snap.val()) {
                this.state.typingRef.child(channelId)
                        .child(this.state.user.uid)
                        .onDisconnect()
                        .remove(err => {
                            console.log(err)
                        })
            }
        })
    }

    addMessageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            })
            this.countUniqueUsers(loadedMessages);
            this.countUserPosts(loadedMessages);
        });
        this.addToListeners(channelId, ref, 'child_added');
    }

    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, isPrivate } = this.state;
        return isPrivate ? privateMessagesRef : messagesRef;
    }

    handleStar = () => {
        this.setState( prevState => ({
            isChannelstarred: !prevState.isChannelstarred
        }), () => this.starChannel());
    }

    starChannel = () => {
        if(this.state.isChannelstarred) {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })
        }else {
            this.state.usersRef
                .child(`${this.state.user.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if(err) {
                        console.error(err);
                    }
                })
        }
    }

    handleSearchChange = event => {
        this.setState({
            searchTern: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages())
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTern, 'gi');
        const searchResult = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc;
        }, []);
        this.setState({ searchResult });
        setTimeout(() => {
            this.setState({ searchLoading: false });
        }, 1000)
    }

    countUniqueUsers = messages => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
        const numOfUniqueUsers = `${uniqueUsers.length} user${plural ? 's': ''}`;
        this.setState({ numOfUniqueUsers });
    }

    countUserPosts = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1;
            }else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, {});
        this.props.setUserPosts(userPosts);
    }

    displayMessages = messages => {
        // console.log(messages)
        return messages.length > 0 ? messages.map(message => (
            <Message
                key={message.timestamp} 
                message={message}
                user={this.state.user}
            />
        )): null
    }

    displayChannelName = channel => {
        return channel ? `${this.state.isPrivate ? '@' : '#'}${channel.name}`: '';
    }

    displayTypingUsers = users => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">
                    {user.name} is typing
                </span> <Typing />
            </div>
        ))
    )

    displayMessagesSkeleton = loading => {
        return loading && (
            <Fragment>
                {[...Array(10)].map((_, i) => <Skeleton key={i} />)}
            </Fragment>
        )
    }

    render() {
        const { messagesRef, channel, user, messages, numOfUniqueUsers, 
            searchResult, searchTern, searchLoading, isPrivate ,
            isChannelstarred, typingUsers, messagesLoading
        } = this.state;

        return (
            <Fragment>
                <MessagesHeader 
                    displayChannelName={this.displayChannelName(channel)}
                    numOfUniqueUsers={numOfUniqueUsers}
                    handleSearchChange={this.handleSearchChange}
                    searchLoading={searchLoading}
                    isPrivate={isPrivate}
                    handleStar={this.handleStar}
                    isChannelstarred={isChannelstarred}
                />

                <Segment>
                    <Comment.Group className="messages">
                        {this.displayMessagesSkeleton(messagesLoading)}
                        { searchTern ? this.displayMessages(searchResult) : this.displayMessages(messages)}
                        { this.displayTypingUsers(typingUsers) }
                        <div ref={node => this.messagesEnd = node}></div>
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messagesRef={messagesRef}
                    currentChannel={channel}
                    currentUser={user}
                    isPrivate={isPrivate}
                    getMessagesRef={this.getMessagesRef}
                />
            </Fragment>
        )
    }
}

export default connect(null, {
    setUserPosts
})(Messages);