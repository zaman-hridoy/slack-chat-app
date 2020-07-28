import React, { Component, Fragment } from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setColors } from '../../actions/index.js';

class ColorPanel extends Component {
    state = {
        modal: false,
        primary: '',
        secondary: '',
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        userColors: []
    }

    componentDidMount() {
        if(this.state.user) {
            this.addListener(this.state.user.uid);
        }
    }

    componentWillUnmount() {
        this.removeListerner();
    }

    removeListerner = () => {
        this.state.userRef.child(`${this.state.user.uid}/color`).off();
    }

    addListener = userId => {
        let userColors = [];
        this.state.userRef.child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val());
                this.setState({ userColors })
            })
    }

    openModal = () => this.setState({ modal: true });
    closeModal = () => this.setState({ modal: false });

    handleChangePrimary = color => this.setState({ primary: color.hex });
    handleChangeSecondary = color => this.setState({ secondary: color.hex });

    handleSaveColor = () => {
        if(this.state.primary && this.state.secondary) {
            this.saveColor(this.state.primary, this.state.secondary);
        }
    }

    saveColor = (primary, secondary) => {
        this.state.userRef
                  .child(`${this.state.user.uid}/colors`)
                  .push()
                  .update({
                    primary,
                    secondary
                }).then(() => {
                    console.log('colors added');
                    this.closeModal();
                }).catch(err => console.log(err));
    }

    displayUserColors = colors => {
        return colors.length > 0 && colors.map((color, index) => {
            return <Fragment key={index}>
                <Divider />
                <div className="color_container" onClick={() => this.props.setColors(color.primary, color.secondary)}>
                    <div className="color_square" style={{ background: color.primary }}>
                        <div className="color_overlay"  style={{ background: color.secondary }}></div>
                    </div>
                </div>
            </Fragment>
        })
    }

    render() {
        const { modal, primary, secondary, userColors } = this.state;
        return (
            <Sidebar 
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />
                {this.displayUserColors(userColors)}

                {/* color picker modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Color</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content="Primary Color" />
                            <SliderPicker color={primary} onChange={this.handleChangePrimary} />
                        </Segment>

                        <Segment inverted>
                            <Label content="Secondary Color" />
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary} />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColor}>
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )
    }
}

export default connect(null, {
    setColors
})(ColorPanel);