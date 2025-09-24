import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import './CategorySelector.css';

const CategorySelector = ({ 
    teamId, 
    selectedCategory, 
    onCategorySelect, 
    error 
}) => {
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategoryName, setSelectedCategoryName] = useState('카테고리 선택');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            if (teamId) {
                try {
                    const response = await axios.get(`/teams/${teamId}/categories`);
                    const categoryList = response.data || [];
                    setCategories(categoryList);
                    // setCategories(response.data || []);
                        // 선택된 카테고리가 있으면 해당 카테고리 이름으로 설정
                        if (selectedCategory && categoryList.length > 0) {
                            const selectedCat = categoryList.find(cat => cat.id === selectedCategory);
                            if (selectedCat) {
                                setSelectedCategoryName(selectedCat.name);
                            }
                        }
                } catch (error) {
                    console.error('카테고리 목록 조회 실패:', error);
                    setCategories([]);
                }
            }
        };

        fetchCategories();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [teamId, selectedCategory]);

    const handleCategorySelect = (categoryId, categoryName) => {
        onCategorySelect(categoryId);
        setSelectedCategoryName(categoryName);
        setIsDropdownOpen(false);
    };

    return (
        <div className="category-selector" ref={dropdownRef}>
            <button
                type="button"
                className="category-dropdown-button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
            >
                <span>{selectedCategoryName}</span>
                <i className={`dropdown-caret ${isDropdownOpen ? 'open' : ''}`}></i>
            </button>

            {isDropdownOpen && (
                <div className="category-list" role="listbox">
                    {categories.map(category => (
                        <div
                            key={category.id}
                            className={`category-item ${selectedCategory === category.id ? 'selected' : ''}`}
                            onClick={() => handleCategorySelect(category.id, category.name)}
                            role="option"
                            aria-selected={selectedCategory === category.id}
                        >
                            <span>{category.name}</span>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default CategorySelector;
