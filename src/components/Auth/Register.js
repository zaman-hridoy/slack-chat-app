import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Message, Icon, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

export default class Register extends Component {

    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    isFormValid = () => {
        let errors = [];
        let error;
        if(this.isFormEmpty(this.state)) {
            // throw error
            error = { message: 'Fill in all fields' }
            this.setState({
                errors: errors.concat(error)
            })
            return false;
        }else if(!this.isPasswordValid(this.state)){
            // throw error
            error = { message: 'Password is invalid' }
            this.setState({
                errors: errors.concat(error)
            })
            return false;
        }else {
            return true;
        }
    }

    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    }

    isPasswordValid = ({password, passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        }else if(password !== passwordConfirmation) {
            return false
        }else {
            return true;
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid()) {
            this.setState({ errors: [], loading: true });
            firebase.auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createUser => {
                    console.log(createUser);
                    createUser.user.updateProfile({
                         displayName: this.state.username,
                         photoURL: `http://gravatar.com/avatar/${md5(createUser.user.email)}?d=identicon`
                    })
                    .then(() => {
                        this.setState({ loading: false });
                        this.saveUser(createUser).then(() => {
                            console.log('User saved');
                        })
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({errors: this.state.errors.concat(err), loading: false})
                    })
                })
                .catch(err => {
                    console.log(err);
                    this.setState({ errors: this.state.errors.concat(err) ,loading: false });
                });
        }
    }

    saveUser = createUser => {
        return this.state.usersRef.child(createUser.user.uid).set({
            name: createUser.user.displayName,
            avatar: createUser.user.photoURL
        });
    }

    displayErrors = errors => errors.map((error, index) => <p key={index}> {error.message} </p>);

    handleInputError = (errors, inputName) => {
        return errors.some(error => 
            error.message.toLowerCase().includes(inputName)
        ) ? 'error': '';
    }

    render() {
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth:450 }}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="puzzle piece" color="orange" />
                        Register for Chat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
                            <Form.Input 
                                fluid 
                                name="username" 
                                icon="user" 
                                iconPosition="left" 
                                placeholder="Username"
                                onChange={this.handleChange}
                                type="text"
                                value={this.state.username}
                            />
                            <Form.Input 
                                fluid 
                                name="email" 
                                icon="mail" 
                                iconPosition="left" 
                                placeholder="Email Address"
                                onChange={this.handleChange}
                                type="email"
                                value={this.state.email}
                                className={this.handleInputError(this.state.errors, 'email')}
                            />
                            <Form.Input 
                                fluid 
                                name="password" 
                                icon="lock" 
                                iconPosition="left" 
                                placeholder="Password"
                                onChange={this.handleChange}
                                type="password"
                                value={this.state.password}
                                className={this.handleInputError(this.state.errors, 'password')}
                            />
                            <Form.Input 
                                fluid 
                                name="passwordConfirmation" 
                                icon="repeat" 
                                iconPosition="left" 
                                placeholder="Password Confirmation"
                                onChange={this.handleChange}
                                type="password"
                                value={this.state.passwordConfirmation}
                                className={this.handleInputError(this.state.errors, 'password')}
                            />
                            <Button disabled={this.state.loading} className={this.state.loading ? 'loading': ''} color="orange"fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {
                        this.state.errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3>
                                {this.displayErrors(this.state.errors)}
                            </Message>
                        )
                    }
                    <Message>Already a user? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
