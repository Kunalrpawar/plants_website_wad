import React, { useState, useEffect } from 'react';
import './App.css';
import PlantChatbot from './components/PlantChatbot';

// Plant interface 
interface Plant {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  description: string;
  _id?: string; // Optional MongoDB ObjectId
}

interface CartItem {
  plant: Plant;
  quantity: number;
}

function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [scrollHeader, setScrollHeader] = useState(false);
  const [scrollUp, setScrollUp] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Change Background Header
  useEffect(() => {
    const scrollHeader = () => {
      if (window.scrollY >= 80) setScrollHeader(true);
      else setScrollHeader(false);
    };
    window.addEventListener('scroll', scrollHeader);
    return () => window.removeEventListener('scroll', scrollHeader);
  }, []);

  // Show Scroll Up
  useEffect(() => {
    const scrollUp = () => {
      if (window.scrollY >= 400) setScrollUp(true);
      else setScrollUp(false);
    };
    window.addEventListener('scroll', scrollUp);
    return () => window.removeEventListener('scroll', scrollUp);
  }, []);

  // Dark light theme
  useEffect(() => {
    if (darkTheme) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }, [darkTheme]);

  // Sample plant data
  const [plants, setPlants] = useState<Plant[]>([
    {
      id: 1,
      name: 'Monstera Deliciosa',
      image: '/assets/img/product1.png',
      price: 29.99,
      category: 'Indoor',
      description: 'The Swiss Cheese Plant, known for its iconic split leaves.'
    },
    {
      id: 2,
      name: 'Snake Plant',
      image: '/assets/img/product2.png',
      price: 19.99,
      category: 'Indoor',
      description: 'Low-maintenance plant that purifies air and thrives in most conditions.'
    },
    {
      id: 3,
      name: 'Peace Lily',
      image: '/assets/img/product3.png',
      price: 24.99,
      category: 'Indoor',
      description: 'Elegant flowering plant that removes toxins from the air.'
    },
    {
      id: 4,
      name: 'Fiddle Leaf Fig',
      image: '/assets/img/product4.png',
      price: 49.99,
      category: 'Indoor',
      description: 'Popular houseplant with large, violin-shaped leaves.'
    },
    {
      id: 5,
      name: 'Aloe Vera',
      image: '/assets/img/product5.png',
      price: 15.99,
      category: 'Succulent',
      description: 'Medicinal plant with thick, fleshy leaves filled with gel.'
    },
    {
      id: 6,
      name: 'Boston Fern',
      image: '/assets/img/product6.png',
      price: 22.99,
      category: 'Indoor',
      description: 'Lush and feathery fronds that add a tropical touch to any space.'
    }
  ]);

  // Filter state
  const [filter, setFilter] = useState<string>('All');

  // Filtered plants
  const filteredPlants = filter === 'All' 
    ? plants 
    : plants.filter(plant => plant.category === filter);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm)
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setContactForm({ name: '', email: '', message: '' }); // Reset form
      } else {
        const error = await response.json();
        alert('Error sending message: ' + (error.message || 'Please try again'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending message. Please try again.');
    }
  };

  const addToCart = (plant: Plant) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.plant.id === plant.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.plant.id === plant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { plant, quantity: 1 }];
    });
    alert('Added to cart!');
  };

  const removeFromCart = (plantId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.plant.id !== plantId));
  };

  const updateQuantity = (plantId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.plant.id === plantId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create order object with simpler structure
      const orderData = {
        user: {
          name: billingInfo.fullName,
          email: billingInfo.email,
          address: `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state} ${billingInfo.zipCode}`
        },
        items: cartItems.map(item => ({
          // Just use the ID as a string - the backend will handle finding the right plant
          plant: item.plant.id.toString(),
          quantity: item.quantity,
          price: item.plant.price
        })),
        totalAmount: cartTotal,
        status: 'pending'
      };

      console.log('Submitting order with data:', JSON.stringify(orderData));

      // Send order to backend
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();
      console.log('Response from server:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to save order');
      }

      // Show success and clear cart
      setShowCheckout(false);
      setShowPaymentSuccess(true);
      setCartItems([]);
      // Reset billing info
      setBillingInfo({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
    } catch (error: any) {
      console.error('Error saving order:', error);
      alert(`Error processing your order: ${error.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.plant.price * item.quantity), 0);
  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Effect to save plant data to database on component mount
  useEffect(() => {
    const savePlantsToDatabase = async () => {
      try {
        // Check if plants already exist in database to avoid duplicates
        const checkResponse = await fetch('http://localhost:5000/api/plants');
        const existingPlants = await checkResponse.json();
        
        if (existingPlants && existingPlants.length > 0) {
          console.log('Plants already exist in database');
          return;
        }
        
        // Save plant data to database if none exists
        for (const plant of plants) {
          const plantData = {
            name: plant.name,
            description: plant.description,
            price: plant.price,
            imageUrl: plant.image,
            category: plant.category,
            stockQuantity: 10 // Default stock
          };
          
          const response = await fetch('http://localhost:5000/api/plants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(plantData)
          });
          
          if (!response.ok) {
            console.error('Failed to save plant:', plant.name);
          }
        }
        console.log('All plant data saved to database');
      } catch (error) {
        console.error('Error saving plants to database:', error);
      }
    };
    
    // Call function to save plants
    savePlantsToDatabase();
  }, []); // Empty dependency array ensures it only runs once on mount

  return (
    <div className="App">
      <header className={`header ${scrollHeader ? 'scroll-header' : ''}`} id="header">
        <nav className="nav container">
          <a href="#home" className="nav__logo">
            <i className="ri-leaf-line nav__logo-icon"></i> Plantex
          </a>

          <div className={`nav__menu ${showMenu ? 'show-menu' : ''}`} id="nav-menu">
            <ul className="nav__list">
              <li className="nav__item">
                <a href="#home" className="nav__link active-link">Home</a>
              </li>
              <li className="nav__item">
                <a href="#about" className="nav__link">About</a>
              </li>
              <li className="nav__item">
                <a href="#products" className="nav__link">Products</a>
              </li>
              <li className="nav__item">
                <a href="#faqs" className="nav__link">FAQs</a>
              </li>
              <li className="nav__item">
                <a href="#contact" className="nav__link">Contact Us</a>
              </li>
            </ul>

            <div className="nav__close" id="nav-close" onClick={() => setShowMenu(false)}>
              <i className="ri-close-line"></i>
            </div>
          </div>

          <div className="nav__btns">
            <div className="cart-icon" onClick={() => setShowCart(!showCart)}>
              <i className="ri-shopping-cart-line"></i>
              {cartItemsCount > 0 && <span className="cart-count">{cartItemsCount}</span>}
            </div>
            <i 
              className={`ri-${darkTheme ? 'sun' : 'moon'}-line change-theme`} 
              id="theme-button"
              onClick={() => setDarkTheme(!darkTheme)}
            ></i>

            <div className="nav__toggle" id="nav-toggle" onClick={() => setShowMenu(true)}>
              <i className="ri-menu-line"></i>
            </div>
          </div>
        </nav>

        {/* Cart Dropdown */}
        {showCart && (
          <div className="cart-dropdown">
            <h3>Shopping Cart</h3>
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <>
                {cartItems.map(item => (
                  <div key={item.plant.id} className="cart-item">
                    <img src={item.plant.image} alt={item.plant.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4>{item.plant.name}</h4>
                      <p>Rs{item.plant.price.toFixed(2)}</p>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.plant.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.plant.id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="remove-item" onClick={() => removeFromCart(item.plant.id)}>
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <h4>Total: Rs{cartTotal.toFixed(2)}</h4>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="modal-overlay">
          <div className="checkout-modal">
            <div className="modal-header">
              <h2>Checkout</h2>
              <button className="close-modal" onClick={() => setShowCheckout(false)}>×</button>
            </div>
            
            <div className="checkout-content">
              <div className="order-summary">
                <h3>Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.plant.id} className="checkout-item">
                    <img src={item.plant.image} alt={item.plant.name} />
                    <div>
                      <h4>{item.plant.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: Rs{(item.plant.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="checkout-total">
                  <h3>Total: Rs{cartTotal.toFixed(2)}</h3>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="billing-form">
                <h3>Billing Information</h3>
                
                <div className="form-group">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={billingInfo.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={billingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={billingInfo.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={billingInfo.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="state"
                      placeholder="State"
                      value={billingInfo.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="ZIP Code"
                      value={billingInfo.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <h3>Payment Information</h3>
                
                <div className="form-group">
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={billingInfo.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={billingInfo.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="text"
                      name="cvv"
                      placeholder="CVV"
                      value={billingInfo.cvv}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="pay-button">
                  Pay Rs{cartTotal.toFixed(2)}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">
              <i className="ri-checkbox-circle-line"></i>
            </div>
            <h2>Payment Successful!</h2>
            <p>Thank you for your purchase.</p>
            <p>Your order has been confirmed and will be shipped soon.</p>
            <button className="button button--flex" onClick={() => setShowPaymentSuccess(false)}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <main className="main">
        <section className="home" id="home">
          <div className="home__container container grid">
            <img src="/assets/img/home.png" alt="Home plant" className="home__img" />

            <div className="home__data">
              <h1 className="home__title">
                Plants will make <br /> your life better
              </h1>
              <p className="home__description">
                Create incredible plant design for your offices or apartments. 
                Add freshness to your new ideas.
              </p>
              <a href="#about" className="button button--flex">
                Explore <i className="ri-arrow-right-down-line button__icon"></i>
              </a>
            </div>

            <div className="home__social">
              <span className="home__social-follow">Follow Us</span>

              <div className="home__social-links">
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="home__social-link">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="home__social-link">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="home__social-link">
                  <i className="ri-twitter-fill"></i>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="about section container" id="about">
          <div className="about__container grid">
            <img src="/assets/img/about.png" alt="About plants" className="about__img" />

            <div className="about__data">
              <h2 className="section__title about__title">
                Who we really are & <br /> why choose us
              </h2>

              <p className="about__description">
                We have over 4000+ unbiased reviews and our customers 
                trust our plant process and delivery service every time.
              </p>

              <div className="about__details">
                <p className="about__details-description">
                  <i className="ri-checkbox-fill about__details-icon"></i>
                  We always deliver on time.
                </p>
                <p className="about__details-description">
                  <i className="ri-checkbox-fill about__details-icon"></i>
                  We give you guides to protect and care for your plants.
                </p>
                <p className="about__details-description">
                  <i className="ri-checkbox-fill about__details-icon"></i>
                  We always come over for a check-up after sale.
                </p>
                <p className="about__details-description">
                  <i className="ri-checkbox-fill about__details-icon"></i>
                  100% money back guaranteed.
                </p>
              </div>

              <a href="#products" className="button--link button--flex">
                Shop Now <i className="ri-arrow-right-down-line button__icon"></i>
              </a>
            </div>
          </div>
        </section>

        <section className="product section container" id="products">
          <h2 className="section__title-center">
            Check out our <br /> products
          </h2>

          <p className="product__description">
            Here are some selected plants from our showroom, all are in excellent 
            shape and has a long life span. Buy and enjoy best quality.
          </p>

          <div className="product__container grid">
            {filteredPlants.map(plant => (
              <div className="card plant-card" key={plant.id}>
                <img src={plant.image} alt={plant.name} className="plant-image" />
                <div className="plant-info">
                  <h3>{plant.name}</h3>
                  <p className="price">Rs{plant.price.toFixed(2)}</p>
                  <p className="description">{plant.description}</p>
                  <button className="btn" onClick={() => addToCart(plant)}>Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="questions section" id="faqs">
          <h2 className="section__title-center questions__title container">
            Some common questions <br /> were often asked
          </h2>

          <div className="questions__container container grid">
            {/* FAQ items will be mapped here */}
          </div>
        </section>

        <section className="contact section container" id="contact">
          <div className="contact__container grid">
            <div className="contact__box">
              <h2 className="section__title">
                Reach out to us today <br /> via any of the given <br /> information
              </h2>

              <div className="contact__data">
                <div className="contact__information">
                  <h3 className="contact__subtitle">Call us for instant support</h3>
                  <span className="contact__description">
                    <i className="ri-phone-line contact__icon"></i>
                    +999 888 777
                  </span>
                </div>

                <div className="contact__information">
                  <h3 className="contact__subtitle">Write us by mail</h3>
                  <span className="contact__description">
                    <i className="ri-mail-line contact__icon"></i>
                    user@email.com
                  </span>
                </div>
              </div>
            </div>

            <form className="contact__form" onSubmit={handleContactSubmit}>
              <div className="contact__inputs">
                <div className="contact__content">
                  <input 
                    type="text"
                    placeholder=" " 
                    className="contact__input"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                  <label className="contact__label">Name</label>
                </div>

                <div className="contact__content">
                  <input 
                    type="email" 
                    placeholder=" " 
                    className="contact__input"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                  <label className="contact__label">Email</label>
                </div>

                <div className="contact__content contact__area">
                  <textarea 
                    name="message" 
                    placeholder=" " 
                    className="contact__input"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  ></textarea>
                  <label className="contact__label">Message</label>
                </div>
              </div>

              <button type="submit" className="button button--flex">
                Send Message
                <i className="ri-arrow-right-up-line button__icon"></i>
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer section">
        <div className="footer__container container grid">
          <div className="footer__content">
            <a href="#home" className="footer__logo">
              <i className="ri-leaf-line footer__logo-icon"></i> Plantex
            </a>

            <h3 className="footer__title">
              Subscribe to our newsletter <br /> to stay updated
            </h3>

            <div className="footer__subscribe">
              <input type="email" placeholder="Enter your email" className="footer__input" />

              <button className="button button--flex footer__button">
                Subscribe
                <i className="ri-arrow-right-up-line button__icon"></i>
              </button>
            </div>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">Our Address</h3>

            <ul className="footer__data">
              <li className="footer__information">1234 - Peru</li>
              <li className="footer__information">La Libertad - 43210</li>
              <li className="footer__information">123-456-789</li>
            </ul>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">Contact Us</h3>

            <ul className="footer__data">
              <li className="footer__information">+999 888 777</li>
              
              <div className="footer__social">
                <a href="https://www.facebook.com/" className="footer__social-link">
                  <i className="ri-facebook-fill"></i>
                </a>
                <a href="https://www.instagram.com/" className="footer__social-link">
                  <i className="ri-instagram-line"></i>
                </a>
                <a href="https://twitter.com/" className="footer__social-link">
                  <i className="ri-twitter-fill"></i>
                </a>
              </div>
            </ul>
          </div>

          <div className="footer__content">
            <h3 className="footer__title">We accept all credit cards</h3>

            <div className="footer__cards">
              <img src="/assets/img/card1.png" alt="Visa" className="footer__card" />
              <img src="/assets/img/card2.png" alt="Mastercard" className="footer__card" />
              <img src="/assets/img/card3.png" alt="PayPal" className="footer__card" />
              <img src="/assets/img/card4.png" alt="Discover" className="footer__card" />
            </div>
          </div>
        </div>

        <p className="footer__copy">&#169; Bedimcode. All rights reserved</p>
      </footer>
      
      {/* Add PlantChatbot */}
      <PlantChatbot />
      
      <a href="#home" className={`scrollup ${scrollUp ? 'show-scroll' : ''}`} id="scroll-up">
        <i className="ri-arrow-up-fill scrollup__icon"></i>
      </a>
    </div>
  );
}

export default App;
