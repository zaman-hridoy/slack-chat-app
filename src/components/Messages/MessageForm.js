import React, { Component } from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import { v4 as uuidv4 } from 'uuid';
import firebase from '../../firebase';
import FileModal from './FileModal.js';
import ProgressBar from './ProgressBar';
import { Picker, emojiIndex } from 'emoji-mart';
import 'emoji-mart/css/emoji-mart.css';

export default class MessageForm extends Component {

    state = {
        storageRef: firebase.storage().ref(),
        typingRef: firebase.database().ref('typing'),
        uploadTask: null,
        uploadState: '',
        percentUploaded: 0,
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        loading: false,
        errors: [],
        modal: false,
        emojiPicker: false
    }

    componentWillUnmount() {
        if(this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({ uploadTask: null });
        }
    }

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    handleChange = event => {
        this.setState({ [event.target.name]: event.target.value })
    }

    handleKeyDown = event => {
        const { message, typingRef, channel, user } = this.state;

        if(event.ctrlKey && event.keyCode === 13) {
            this.sendMessage();
        }

        if(message) {
            typingRef.child(channel.id)
                    .child(user.uid)
                    .set(user.displayName)
        }else {
            typingRef.child(channel.id)
                    .child(user.uid)
                    .remove()
        }
    }

    handleToglePicker = () => {
        this.setState({ emojiPicker:  !this.state.emojiPicker})
    }

    handleAddEmoji = emoji => {
        const oldMessage = this.state.message;
        const newMessage = this.colonToUnicode(` ${oldMessage} ${emoji.colons}`);
        this.setState({ message: newMessage, emojiPicker: false })
        setTimeout(() => this.messageInputRef.focus(), 0);
    }
    
    colonToUnicode = message => {
        return message.replace(/:[A-Za-z0-9_+-]+:/g, x => {
            x = x.replace(/:/g, "");
            let emoji = emojiIndex.emojis[x];
            if(typeof emoji !== 'undefined') {
                let unicode = emoji.native;
                if(typeof unicode !== 'undefined') {
                    return unicode;
                }
            }

            x = ":" + x + ":";
            return x;
        });
    }

    createMessage = ( fileUrl=null ) => {
        console.log(fileUrl)
        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            }
        }
        if(fileUrl !== null) {
            message['image'] = fileUrl;
        }else {
            message['content'] = this.state.message;
        }
        return message;
    }

    sendMessage = () => {
        const { getMessagesRef } = this.props;
        const { message, channel, typingRef, user } = this.state;

        if(message) {
            this.setState({ loading: true })
            getMessagesRef().child(channel.id)
                    .push()
                    .set(this.createMessage())
                    .then(() => {
                        this.setState({ loading: false, message: '', errors: [] });
                        typingRef.child(channel.id)
                                .child(user.uid)
                                .remove()
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({
                            loading: false,
                            errors: this.state.errors.concat(err)
                        });
                    });
        }else {
            this.setState({
                errors: this.state.errors.concat({ message: 'Add a message' })
            });
        }

    }

    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        console.log(fileUrl, ref, pathToUpload)
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fileUrl))
            .then(() => {
                this.setState({
                    uploadState: 'done'
                })
            }).catch(err => {
                console.log(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                })
            })
    }

    getPath = () => {
        if(this.props.isPrivate) {
            return `chat/private/${this.state.channel.id}`;
        }else {
            return 'chat/public';
        }
    }

    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        }, () => {
            this.state.uploadTask.on('state_changed', snap => {
                const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                this.setState({ percentUploaded });
            }, err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err),
                    uploadState: 'error',
                    uploadTask: null
                });
            }, () => {
                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
                    this.sendFileMessage(downloadUrl, ref, pathToUpload);
                })
                .catch(err => {
                    console.error(err);
                    this.setState({
                        errors: this.state.errors.concat(err),
                        uploadState: 'error',
                        uploadTask: null
                    });
                })
            })
        })
    }

    render() {

        const { errors, loading, modal, uploadState, emojiPicker } = this.state;

        return (
            <Segment className="message__form">
                {emojiPicker && (
                    <Picker 
                        set="apple"
                        className="emojipicker"
                        title="Pick your emoji"
                        emoji="point_up"
                        onSelect={this.handleAddEmoji}
                    />
                )}
                <Input 
                    fluid
                    name="message"
                    style={{ marginBottom: '0.7em' }}
                    label={
                        <Button 
                            icon={emojiPicker ? 'close' : 'add'} 
                            content={emojiPicker ? 'Close': null}
                            onClick={this.handleToglePicker} 
                        />
                    }
                    value={this.state.message}
                    labelPosition="left"
                    placeholder="Write your message..."
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    ref={node => this.messageInputRef = node}
                />
                <Button.Group icon widths="2">
                    <Button 
                        color="orange"
                        content="Add Reply"
                        labelPosition="left"
                        disabled={loading}
                        icon="edit"
                        onClick={this.sendMessage}
                    />
                    <Button 
                        color="teal"
                        disabled={uploadState === 'uploading'}
                        content="Upload Media"
                        labelPosition="right"
                        icon="cloud upload"
                        onClick={this.openModal}
                    />
                </Button.Group>

                <FileModal 
                    modal={modal}
                    closeModal={this.closeModal}
                    uploadFile={this.uploadFile}
                />
                <ProgressBar
                    uploadState={this.state.uploadState}
                    percentUploaded={this.state.percentUploaded}
                />
            </Segment>
        )
    }
}
