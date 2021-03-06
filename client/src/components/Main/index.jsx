import React, { Component } from 'react';
import { gql } from "@apollo/client";
import { withRouter } from "react-router";
import { NavLink } from 'react-router-dom';
import Card from '../Card';
import styles from './Main.module.scss';
import Drawer from '../Drawer';
import CurrencySwitcher from '../CurrencySwitcher';


class Main extends Component {
    constructor(props) {
        super(props)

        this.state = {
            currency: 'USD',
        }
    }

    getProducts = async () => {
        let products;
        products = await this.props.client.query({
            query: gql`
                query {
                    category(input: {
                        title: "${this.props.match.params.id}"
                      }){
                        products{
                            id
                            name
                            inStock
                            gallery
                            description
                            category
                            attributes {
                                name
                                items {
                                displayValue
                                value
                                }
                            }
                            prices {
                                currency {
                                label
                                symbol
                                }
                                amount
                            }
                            brand
                        }
                    }
                }
            `
        });

        this.setState(
            {
                products: products.data,
                url: this.props.match.params.id
            }
        );
    }

    componentDidMount = () => {
        this.getProducts();
        this.setState(
            {
                currency: localStorage.getItem('currency')
            }
        )
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.location.pathname !== prevProps.location.pathname) {
            this.getProducts();
        }

        if (this.props.currency !== prevProps.currency) {
            this.setState(
                {
                    currency: localStorage.getItem('currency')
                }
            )
        }
    }

    getUrl = () => {
        return (
            this.props.match.params.id[0].toUpperCase() + this.props.match.params.id.slice(1)
        )
    }

    renderFakeCards = () => {
        return (
            this.state.products?.category.products.length <= 2
                ?
                <Card
                    fakeCard={'fakeCard'}
                    number={3 - this.state.products?.category.products.length}
                />
                :
                null
        )
    }

    render = () => {
        return (
            <main className={styles.main}>
                {
                    this.props.switcherOpened
                    &&
                    <CurrencySwitcher
                        client={this.props.client}
                        onSwitcher={this.props.onClickSwitcher}
                        setCurrency={this.props.setCurrency}
                    />
                }
                {
                    this.props.cartOpened
                    &&
                    <Drawer
                        onDrawer={this.props.onClickCart}
                        countingQuantity={this.props.countingQuantity}
                        items={this.props.counter}
                    />
                }
                <h2 className={styles.category}>{this.getUrl()}</h2>
                <section className={styles.container}>
                    {this.state.products?.category?.products.map(i =>
                        <NavLink key={i.id} exact to={`${this.state.url}/product/${i.id}`}>
                            <Card
                                id={i.id}
                                name={i.name}
                                inStock={i.inStock}
                                gallery={i.gallery}
                                category={i.category}
                                description={i.description}
                                attributes={i.attributes}
                                prices={i.prices}
                                brand={i.brand}
                                addToCart={this.props.addToCart}
                                currency={this.state.currency}
                                countingQuantity={this.props.countingQuantity}
                            />
                        </NavLink>
                    )}
                    {this.renderFakeCards()}
                </section>
            </main>
        );
    }
}

export default withRouter(Main);
