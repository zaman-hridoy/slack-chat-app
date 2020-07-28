import React, { Component } from 'react';
import { Grid, Form, Segment, Button, Message, Icon, Header } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';

export default class Login extends Component {

    state = {
        email: '',
        password: '',
        errors: [],
        loading: false
    }

    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    isFormValid = ({email, password}) => {
        if(!email.length || !password.length) {
            let errors = [{message: 'Fill in all fields'}];
            this.setState({
                errors
            });
            return false;
        }else {
            return true;
        }
    }

    handleSubmit = event => {
        event.preventDefault();
        console.log(this.isFormValid(this.state))
        this.setState({ errors: []});
        if(this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true });
            firebase.auth()
                    .signInWithEmailAndPassword(this.state.email, this.state.password)
                    .then(signedInUser => {
                        console.log(signedInUser)
                    })
                    .catch(err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            loading: false
                        });
                    });
        }
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
                    <Header as="h2" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login to Chat
                    </Header>
                    <Form size="large" onSubmit={this.handleSubmit}>
                        <Segment stacked>
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
                            <Button disabled={this.state.loading} className={this.state.loading ? 'loading': ''} color="violet"fluid size="large">Submit</Button>
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
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}
