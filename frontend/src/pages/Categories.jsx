import React, { useState, useEffect } from "react";
import api from "../services/api"; // Import file axios instance

function Categories() {
    // 1. Initial State
    // 'categories' save list cate from API (default is the empty list [])
    // 'setCategories' is the unique function that use to update data for 'categories'
    const [categories, setCategories] = useState([]);

    // State save loading data state (loading)
    const [loading, setLoading] = useState(true);

    // 2. Use useEffect (Run code when page is displayed in the first time)
    useEffect(() => {
        // Call api to take finance categories
        api.get('/api/finance/categories')
            .then((response) => {
                // Update received data to state categories
                setCategories(response.data);
                setLoading(false); // finished loading
            })
            .catch((error) => {
                console.error("Error when fetching categories: ", error);
                setLoading(false);
            })
    }, []); // Empty list []: is mean it ensures API will be called 1 times when loading page

    // 3. Handling the UI during loading
    if (loading) {
        return <div style={{ padding: '20px' }}>Loading categories...</div>;
    }

    // 4. Return JSX UI to display categories
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ color: '#2c3e50' }}>Manage Finance Categories</h2>
            <p>Below is a list loaded directly from the ASP.NET Core Backend API: </p>
            <ul style={{ lineHeight: '2' }}>
                {
                    /*Use the map() function to iterate through each category 
                    in the 'categories' array and render it as a <li> tag.*/
                }
                {categories.map((category) => (
                    //Each repeated element in React must have a unique 'key' attribute (usually an ID).
                    <li key={category.id}>
                        <strong>{category.name}</strong> - Tipo:
                        <span style={{ color: category.type === 'income' ? 'green' : 'red', marginLeft: '5px' }}>
                            {category.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Categories;