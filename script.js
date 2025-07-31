// Data Storage (In a real app, this would be handled by MongoDB)
        let products = [
            {
                id: 1,
                sku: 'ELE001',
                name: 'Laptop Dell XPS 13',
                category: 'Electronics',
                quantity: 15,
                price: 1299.99,
                minStock: 5,
                supplierId: 1,
                description: 'High-performance ultrabook for professionals'
            },
            {
                id: 2,
                sku: 'CLO001',
                name: 'Cotton T-Shirt',
                category: 'Clothing',
                quantity: 3,
                price: 19.99,
                minStock: 10,
                supplierId: 2,
                description: '100% cotton comfortable t-shirt'
            },
            {
                id: 3,
                sku: 'FOO001',
                name: 'Organic Coffee Beans',
                category: 'Food',
                quantity: 0,
                price: 24.99,
                minStock: 5,
                supplierId: 3,
                description: 'Premium organic coffee beans from Colombia'
            },
            {
                id: 4,
                sku: 'ELE002',
                name: 'Wireless Mouse',
                category: 'Electronics',
                quantity: 45,
                price: 29.99,
                minStock: 15,
                supplierId: 1,
                description: 'Ergonomic wireless mouse with precision tracking'
            },
            {
                id: 5,
                sku: 'BOO001',
                name: 'JavaScript Guide',
                category: 'Books',
                quantity: 8,
                price: 39.99,
                minStock: 3,
                supplierId: 4,
                description: 'Complete guide to JavaScript programming'
            }
        ];

        let suppliers = [
            {
                id: 1,
                company: 'Tech Solutions Inc',
                contact: 'John Smith',
                email: 'john@techsolutions.com',
                phone: '+1-555-0123',
                address: '123 Tech Street, San Francisco, CA'
            },
            {
                id: 2,
                company: 'Fashion Forward Ltd',
                contact: 'Sarah Johnson',
                email: 'sarah@fashionforward.com',
                phone: '+1-555-0124',
                address: '456 Fashion Ave, New York, NY'
            },
            {
                id: 3,
                company: 'Organic Supplies Co',
                contact: 'Mike Davis',
                email: 'mike@organicsupplies.com',
                phone: '+1-555-0125',
                address: '789 Organic Way, Portland, OR'
            },
            {
                id: 4,
                company: 'Book World Publishers',
                contact: 'Lisa Brown',
                email: 'lisa@bookworld.com',
                phone: '+1-555-0126',
                address: '321 Book Lane, Boston, MA'
            }
        ];

        let transactions = [
            {
                id: 1,
                productId: 1,
                type: 'stock-in',
                quantity: 5,
                previousStock: 10,
                newStock: 15,
                date: '2024-01-20',
                notes: 'Weekly restock'
            },
            {
                id: 2,
                productId: 2,
                type: 'stock-out',
                quantity: 7,
                previousStock: 10,
                newStock: 3,
                date: '2024-01-19',
                notes: 'Sold to retail customer'
            },
            {
                id: 3,
                productId: 4,
                type: 'stock-in',
                quantity: 20,
                previousStock: 25,
                newStock: 45,
                date: '2024-01-18',
                notes: 'Bulk purchase discount'
            }
        ];

        let editingProductId = null;
        let editingSupplierId = null;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            updateDashboard();
            loadProducts();
            loadSuppliers();
            loadTransactions();
            populateSupplierDropdowns();
            populateProductDropdowns();
            updateReports();
            
            // Add event listeners for filters
            document.getElementById('productSearch').addEventListener('input', filterProducts);
            document.getElementById('categoryFilter').addEventListener('change', filterProducts);
            document.getElementById('stockFilter').addEventListener('change', filterProducts);
            document.getElementById('transactionTypeFilter').addEventListener('change', filterTransactions);
            document.getElementById('dateFromFilter').addEventListener('change', filterTransactions);
            document.getElementById('dateToFilter').addEventListener('change', filterTransactions);
            document.getElementById('manualBarcode').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchByBarcode();
                }
            });
        });

        // Navigation functions
        function showSection(sectionId) {
            // Hide all sections
            const sections = document.querySelectorAll('.content-section');
            sections.forEach(section => section.style.display = 'none');
            
            // Show selected section
            document.getElementById(sectionId).style.display = 'block';
            
            // Update navigation
            const navLinks = document.querySelectorAll('.sidebar .nav-link');
            navLinks.forEach(link => link.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update reports if reports section is shown
            if (sectionId === 'reports') {
                updateReports();
            }
        }

        // Dashboard functions
        function updateDashboard() {
            const totalProducts = products.length;
            const lowStockItems = products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
            const outOfStockItems = products.filter(p => p.quantity === 0).length;
            const totalSuppliers = suppliers.length;
            const totalTransactions = transactions.length;

            document.getElementById('totalProducts').textContent = totalProducts;
            document.getElementById('lowStockItems').textContent = lowStockItems;
            document.getElementById('totalSuppliers').textContent = totalSuppliers;
            document.getElementById('totalTransactions').textContent = totalTransactions;

            // Update recent transactions
            const recentTransactions = transactions.slice(-5).reverse();
            const recentTransactionsHtml = recentTransactions.map(transaction => {
                const product = products.find(p => p.id === transaction.productId);
                const typeClass = transaction.type === 'stock-in' ? 'success' : 
                                transaction.type === 'stock-out' ? 'danger' : 'warning';
                return `
                    <tr>
                        <td>${product ? product.name : 'Unknown Product'}</td>
                        <td><span class="badge bg-${typeClass}">${transaction.type.replace('-', ' ')}</span></td>
                        <td>${transaction.quantity}</td>
                        <td>${new Date(transaction.date).toLocaleDateString()}</td>
                    </tr>
                `;
            }).join('');
            document.getElementById('recentTransactions').innerHTML = recentTransactionsHtml;

            // Update low stock alerts
            const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
            const lowStockAlertsHtml = lowStockProducts.map(product => {
                const alertClass = product.quantity === 0 ? 'danger' : 'warning';
                const alertText = product.quantity === 0 ? 'Out of Stock' : 'Low Stock';
                return `
                    <div class="alert alert-${alertClass} alert-sm mb-2" role="alert">
                        <strong>${product.name}</strong><br>
                        <small>${alertText}: ${product.quantity} units remaining</small>
                    </div>
                `;
            }).join('');
            document.getElementById('lowStockAlerts').innerHTML = lowStockAlertsHtml || 
                '<div class="text-muted text-center">No low stock alerts</div>';
        }

        // Product functions
        function loadProducts() {
            const productsHtml = products.map(product => {
                const supplier = suppliers.find(s => s.id === product.supplierId);
                const status = getStockStatus(product);
                const statusClass = status.class;
                const statusText = status.text;

                return `
                    <tr>
                        <td><code>${product.sku}</code></td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.quantity}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>${supplier ? supplier.company : 'Unknown'}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            document.getElementById('productsTable').innerHTML = productsHtml;
        }

        function getStockStatus(product) {
            if (product.quantity === 0) {
                return { class: 'status-out-of-stock', text: 'Out of Stock' };
            } else if (product.quantity <= product.minStock) {
                return { class: 'status-low-stock', text: 'Low Stock' };
            } else {
                return { class: 'status-in-stock', text: 'In Stock' };
            }
        }

        function filterProducts() {
            const searchTerm = document.getElementById('productSearch').value.toLowerCase();
            const categoryFilter = document.getElementById('categoryFilter').value;
            const stockFilter = document.getElementById('stockFilter').value;

            let filteredProducts = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                    product.sku.toLowerCase().includes(searchTerm);
                const matchesCategory = !categoryFilter || product.category === categoryFilter;
                
                let matchesStock = true;
                if (stockFilter === 'in-stock') {
                    matchesStock = product.quantity > product.minStock;
                } else if (stockFilter === 'low-stock') {
                    matchesStock = product.quantity <= product.minStock && product.quantity > 0;
                } else if (stockFilter === 'out-of-stock') {
                    matchesStock = product.quantity === 0;
                }

                return matchesSearch && matchesCategory && matchesStock;
            });

            const productsHtml = filteredProducts.map(product => {
                const supplier = suppliers.find(s => s.id === product.supplierId);
                const status = getStockStatus(product);
                const statusClass = status.class;
                const statusText = status.text;

                return `
                    <tr>
                        <td><code>${product.sku}</code></td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.quantity}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>${supplier ? supplier.company : 'Unknown'}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            document.getElementById('productsTable').innerHTML = productsHtml;
        }

        function editProduct(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                editingProductId = productId;
                document.getElementById('productSKU').value = product.sku;
                document.getElementById('productName').value = product.name;
                document.getElementById('productCategory').value = product.category;
                document.getElementById('productQuantity').value = product.quantity;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productMinStock').value = product.minStock;
                document.getElementById('productSupplier').value = product.supplierId;
                document.getElementById('productDescription').value = product.description || '';
                
                const modal = new bootstrap.Modal(document.getElementById('productModal'));
                modal.show();
            }
        }

        function deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                products = products.filter(p => p.id !== productId);
                loadProducts();
                updateDashboard();
                updateReports();
                showAlert('Product deleted successfully!', 'success');
            }
        }

        function saveProduct() {
            const sku = document.getElementById('productSKU').value;
            const name = document.getElementById('productName').value;
            const category = document.getElementById('productCategory').value;
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const price = parseFloat(document.getElementById('productPrice').value);
            const minStock = parseInt(document.getElementById('productMinStock').value);
            const supplierId = parseInt(document.getElementById('productSupplier').value);
            const description = document.getElementById('productDescription').value;

            if (!sku || !name || !category || quantity < 0 || price < 0 || minStock < 0 || !supplierId) {
                showAlert('Please fill in all required fields correctly!', 'danger');
                return;
            }

            if (editingProductId) {
                // Update existing product
                const productIndex = products.findIndex(p => p.id === editingProductId);
                if (productIndex !== -1) {
                    products[productIndex] = {
                        ...products[productIndex],
                        sku, name, category, quantity, price, minStock, supplierId, description
                    };
                }
            } else {
                // Add new product
                const newProduct = {
                    id: Math.max(...products.map(p => p.id), 0) + 1,
                    sku, name, category, quantity, price, minStock, supplierId, description
                };
                products.push(newProduct);
            }

            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
            document.getElementById('productForm').reset();
            editingProductId = null;
            
            loadProducts();
            updateDashboard();
            populateProductDropdowns();
            updateReports();
            showAlert('Product saved successfully!', 'success');
        }

        // Supplier functions
        function loadSuppliers() {
            const suppliersHtml = suppliers.map(supplier => {
                const productCount = products.filter(p => p.supplierId === supplier.id).length;
                return `
                    <tr>
                        <td>SUP${supplier.id.toString().padStart(3, '0')}</td>
                        <td>${supplier.company}</td>
                        <td>${supplier.contact}</td>
                        <td>${supplier.email}</td>
                        <td>${supplier.phone}</td>
                        <td>${productCount} products</td>
                        <td class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="editSupplier(${supplier.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${supplier.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
            document.getElementById('suppliersTable').innerHTML = suppliersHtml;
        }

        function editSupplier(supplierId) {
            const supplier = suppliers.find(s => s.id === supplierId);
            if (supplier) {
                editingSupplierId = supplierId;
                document.getElementById('supplierCompany').value = supplier.company;
                document.getElementById('supplierContact').value = supplier.contact;
                document.getElementById('supplierEmail').value = supplier.email;
                document.getElementById('supplierPhone').value = supplier.phone;
                document.getElementById('supplierAddress').value = supplier.address || '';
                
                const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
                modal.show();
            }
        }

        function deleteSupplier(supplierId) {
            const hasProducts = products.some(p => p.supplierId === supplierId);
            if (hasProducts) {
                showAlert('Cannot delete supplier with associated products!', 'danger');
                return;
            }
            
            if (confirm('Are you sure you want to delete this supplier?')) {
                suppliers = suppliers.filter(s => s.id !== supplierId);
                loadSuppliers();
                populateSupplierDropdowns();
                showAlert('Supplier deleted successfully!', 'success');
            }
        }

        function saveSupplier() {
            const company = document.getElementById('supplierCompany').value;
            const contact = document.getElementById('supplierContact').value;
            const email = document.getElementById('supplierEmail').value;
            const phone = document.getElementById('supplierPhone').value;
            const address = document.getElementById('supplierAddress').value;

            if (!company || !contact || !email || !phone) {
                showAlert('Please fill in all required fields!', 'danger');
                return;
            }

            if (editingSupplierId) {
                // Update existing supplier
                const supplierIndex = suppliers.findIndex(s => s.id === editingSupplierId);
                if (supplierIndex !== -1) {
                    suppliers[supplierIndex] = {
                        ...suppliers[supplierIndex],
                        company, contact, email, phone, address
                    };
                }
            } else {
                // Add new supplier
                const newSupplier = {
                    id: Math.max(...suppliers.map(s => s.id), 0) + 1,
                    company, contact, email, phone, address
                };
                suppliers.push(newSupplier);
            }

            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
            modal.hide();
            document.getElementById('supplierForm').reset();
            editingSupplierId = null;
            
            loadSuppliers();
            populateSupplierDropdowns();
            showAlert('Supplier saved successfully!', 'success');
        }

        // Transaction functions
        function loadTransactions() {
            const transactionsHtml = transactions.map(transaction => {
                const product = products.find(p => p.id === transaction.productId);
                const typeClass = transaction.type === 'stock-in' ? 'success' : 
                                transaction.type === 'stock-out' ? 'danger' : 'warning';
                return `
                    <tr>
                        <td>TXN${transaction.id.toString().padStart(4, '0')}</td>
                        <td>${product ? product.name : 'Unknown Product'}</td>
                        <td><span class="badge bg-${typeClass}">${transaction.type.replace('-', ' ')}</span></td>
                        <td>${transaction.quantity}</td>
                        <td>${transaction.previousStock}</td>
                        <td>${transaction.newStock}</td>
                        <td>${new Date(transaction.date).toLocaleDateString()}</td>
                        <td>${transaction.notes || '-'}</td>
                    </tr>
                `;
            }).join('');
            document.getElementById('transactionsTable').innerHTML = transactionsHtml;
        }

        function filterTransactions() {
            const typeFilter = document.getElementById('transactionTypeFilter').value;
            const dateFrom = document.getElementById('dateFromFilter').value;
            const dateTo = document.getElementById('dateToFilter').value;

            let filteredTransactions = transactions.filter(transaction => {
                const matchesType = !typeFilter || transaction.type === typeFilter;
                const matchesDateFrom = !dateFrom || transaction.date >= dateFrom;
                const matchesDateTo = !dateTo || transaction.date <= dateTo;

                return matchesType && matchesDateFrom && matchesDateTo;
            });

            const transactionsHtml = filteredTransactions.map(transaction => {
                const product = products.find(p => p.id === transaction.productId);
                const typeClass = transaction.type === 'stock-in' ? 'success' : 
                                transaction.type === 'stock-out' ? 'danger' : 'warning';
                return `
                    <tr>
                        <td>TXN${transaction.id.toString().padStart(4, '0')}</td>
                        <td>${product ? product.name : 'Unknown Product'}</td>
                        <td><span class="badge bg-${typeClass}">${transaction.type.replace('-', ' ')}</span></td>
                        <td>${transaction.quantity}</td>
                        <td>${transaction.previousStock}</td>
                        <td>${transaction.newStock}</td>
                        <td>${new Date(transaction.date).toLocaleDateString()}</td>
                        <td>${transaction.notes || '-'}</td>
                    </tr>
                `;
            }).join('');
            document.getElementById('transactionsTable').innerHTML = transactionsHtml;
        }

        function saveTransaction() {
            const productId = parseInt(document.getElementById('transactionProduct').value);
            const type = document.getElementById('transactionType').value;
            const quantity = parseInt(document.getElementById('transactionQuantity').value);
            const notes = document.getElementById('transactionNotes').value;

            if (!productId || !type || !quantity) {
                showAlert('Please fill in all required fields!', 'danger');
                return;
            }

            const product = products.find(p => p.id === productId);
            if (!product) {
                showAlert('Selected product not found!', 'danger');
                return;
            }

            const previousStock = product.quantity;
            let newStock = previousStock;

            // Calculate new stock based on transaction type
            if (type === 'stock-in') {
                newStock = previousStock + quantity;
            } else if (type === 'stock-out') {
                if (quantity > previousStock) {
                    showAlert('Cannot remove more stock than available!', 'danger');
                    return;
                }
                newStock = previousStock - quantity;
            } else if (type === 'adjustment') {
                newStock = quantity; // For adjustments, quantity represents the new total
            }

            // Update product stock
            const productIndex = products.findIndex(p => p.id === productId);
            products[productIndex].quantity = newStock;

            // Add transaction record
            const newTransaction = {
                id: Math.max(...transactions.map(t => t.id), 0) + 1,
                productId,
                type,
                quantity,
                previousStock,
                newStock,
                date: new Date().toISOString().split('T')[0],
                notes
            };
            transactions.push(newTransaction);

            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
            modal.hide();
            document.getElementById('transactionForm').reset();
            
            loadTransactions();
            loadProducts();
            updateDashboard();
            updateReports();
            showAlert('Transaction recorded successfully!', 'success');
        }

        // Barcode scanner functions
        function simulateBarcodeScan() {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            displayScannedProduct(randomProduct);
        }

        function searchByBarcode() {
            const barcode = document.getElementById('manualBarcode').value.trim();
            if (!barcode) {
                showAlert('Please enter a barcode or SKU!', 'warning');
                return;
            }

            const product = products.find(p => 
                p.sku.toLowerCase() === barcode.toLowerCase() ||
                p.id.toString() === barcode
            );

            if (product) {
                displayScannedProduct(product);
                document.getElementById('manualBarcode').value = '';
            } else {
                showAlert('Product not found!', 'danger');
                document.getElementById('scannedProductInfo').innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                        <p>Product with barcode "${barcode}" not found</p>
                    </div>
                `;
            }
        }

        function displayScannedProduct(product) {
            const supplier = suppliers.find(s => s.id === product.supplierId);
            const status = getStockStatus(product);
            
            document.getElementById('scannedProductInfo').innerHTML = `
                <div class="card border-0">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description || 'No description available'}</p>
                        
                        <div class="row">
                            <div class="col-6">
                                <small class="text-muted">SKU:</small><br>
                                <code>${product.sku}</code>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Category:</small><br>
                                <span class="badge bg-info">${product.category}</span>
                            </div>
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-6">
                                <small class="text-muted">Price:</small><br>
                                <strong>${product.price.toFixed(2)}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted">Stock:</small><br>
                                <span class="badge ${status.class}">${product.quantity} units</span>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <small class="text-muted">Supplier:</small><br>
                            <span>${supplier ? supplier.company : 'Unknown'}</span>
                        </div>
                        
                        <div class="mt-4">
                            <button class="btn btn-primary btn-sm me-2" onclick="editProduct(${product.id})">
                                <i class="fas fa-edit me-1"></i>Edit Product
                            </button>
                            <button class="btn btn-success btn-sm" onclick="quickAddStock(${product.id})">
                                <i class="fas fa-plus me-1"></i>Add Stock
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        function quickAddStock(productId) {
            const quantity = prompt('Enter quantity to add:');
            if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
                const product = products.find(p => p.id === productId);
                const previousStock = product.quantity;
                const newStock = previousStock + parseInt(quantity);
                
                // Update product
                const productIndex = products.findIndex(p => p.id === productId);
                products[productIndex].quantity = newStock;
                
                // Add transaction
                const newTransaction = {
                    id: Math.max(...transactions.map(t => t.id), 0) + 1,
                    productId,
                    type: 'stock-in',
                    quantity: parseInt(quantity),
                    previousStock,
                    newStock,
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Quick add via barcode scanner'
                };
                transactions.push(newTransaction);
                
                // Refresh displays
                displayScannedProduct(products.find(p => p.id === productId));
                loadProducts();
                loadTransactions();
                updateDashboard();
                updateReports();
                showAlert('Stock added successfully!', 'success');
            }
        }

        // Reports functions
        function updateReports() {
            // Calculate summary statistics
            const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
            const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
            const lowStockCount = products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
            const outOfStockCount = products.filter(p => p.quantity === 0).length;

            document.getElementById('reportTotalValue').textContent = `${totalValue.toFixed(2)}`;
            document.getElementById('reportTotalItems').textContent = totalItems;
            document.getElementById('reportLowStock').textContent = lowStockCount;
            document.getElementById('reportOutOfStock').textContent = outOfStockCount;

            // Update charts
            updateCategoryChart();
            updateTrendChart();
        }

        function updateCategoryChart() {
            const categoryData = {};
            products.forEach(product => {
                const value = product.quantity * product.price;
                if (categoryData[product.category]) {
                    categoryData[product.category] += value;
                } else {
                    categoryData[product.category] = value;
                }
            });

            const ctx = document.getElementById('categoryChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.categoryChart) {
                window.categoryChart.destroy();
            }
            
            window.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryData),
                    datasets: [{
                        data: Object.values(categoryData),
                        backgroundColor: [
                            '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        function updateTrendChart() {
            // Generate mock trend data for the last 7 days
            const labels = [];
            const stockInData = [];
            const stockOutData = [];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                
                // Calculate actual data from transactions for this date
                const dateStr = date.toISOString().split('T')[0];
                const dayTransactions = transactions.filter(t => t.date === dateStr);
                
                const stockIn = dayTransactions
                    .filter(t => t.type === 'stock-in')
                    .reduce((sum, t) => sum + t.quantity, 0);
                const stockOut = dayTransactions
                    .filter(t => t.type === 'stock-out')
                    .reduce((sum, t) => sum + t.quantity, 0);
                
                stockInData.push(stockIn);
                stockOutData.push(stockOut);
            }

            const ctx = document.getElementById('trendChart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (window.trendChart) {
                window.trendChart.destroy();
            }
            
            window.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Stock In',
                        data: stockInData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    }, {
                        label: 'Stock Out',
                        data: stockOutData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Utility functions
        function populateSupplierDropdowns() {
            const supplierOptions = suppliers.map(supplier => 
                `<option value="${supplier.id}">${supplier.company}</option>`
            ).join('');
            
            document.getElementById('productSupplier').innerHTML = 
                '<option value="">Select Supplier</option>' + supplierOptions;
        }

        function populateProductDropdowns() {
            const productOptions = products.map(product => 
                `<option value="${product.id}">${product.name} (${product.sku})</option>`
            ).join('');
            
            document.getElementById('transactionProduct').innerHTML = 
                '<option value="">Select Product</option>' + productOptions;
        }

        function showAlert(message, type) {
            // Create alert element
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
            alertDiv.style.top = '20px';
            alertDiv.style.right = '20px';
            alertDiv.style.zIndex = '9999';
            alertDiv.style.minWidth = '300px';
            alertDiv.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Add to body
            document.body.appendChild(alertDiv);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.remove();
                }
            }, 5000);
        }

        // Event handlers for modal resets
        document.getElementById('productModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('productForm').reset();
            editingProductId = null;
        });

        document.getElementById('supplierModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('supplierForm').reset();
            editingSupplierId = null;
        });

        document.getElementById('transactionModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('transactionForm').reset();
        });

        // Mobile menu toggle
        function toggleMobileMenu() {
            const sidebar = document.querySelector('.sidebar');
            sidebar.classList.toggle('show');
        }

        // Add mobile menu button for responsive design
        if (window.innerWidth <= 768) {
            const mobileMenuBtn = document.createElement('button');
            mobileMenuBtn.className = 'btn btn-primary d-md-none position-fixed';
            mobileMenuBtn.style.top = '20px';
            mobileMenuBtn.style.left = '20px';
            mobileMenuBtn.style.zIndex = '1001';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileMenuBtn.onclick = toggleMobileMenu;
            document.body.appendChild(mobileMenuBtn);
        }

        // Sample data initialization function (for demo purposes)
        function initializeSampleData() {
            // Add some sample transactions with recent dates
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date(today);
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Add more recent transactions for better demo
            transactions.push(
                {
                    id: transactions.length + 1,
                    productId: 1,
                    type: 'stock-out',
                    quantity: 2,
                    previousStock: 15,
                    newStock: 13,
                    date: today.toISOString().split('T')[0],
                    notes: 'Sold to corporate client'
                },
                {
                    id: transactions.length + 2,
                    productId: 3,
                    type: 'stock-in',
                    quantity: 10,
                    previousStock: 0,
                    newStock: 10,
                    date: yesterday.toISOString().split('T')[0],
                    notes: 'Emergency restock'
                },
                {
                    id: transactions.length + 3,
                    productId: 2,
                    type: 'adjustment',
                    quantity: 5,
                    previousStock: 3,
                    newStock: 5,
                    date: twoDaysAgo.toISOString().split('T')[0],
                    notes: 'Inventory count adjustment'
                }
            );

            // Update product quantities based on transactions
            products[0].quantity = 13; // Laptop Dell XPS 13
            products[1].quantity = 5;  // Cotton T-Shirt
            products[2].quantity = 10; // Organic Coffee Beans
        }

        // Initialize sample data on load
        document.addEventListener('DOMContentLoaded', function() {
            initializeSampleData();
            // Re-run initialization after sample data is added
            updateDashboard();
            loadProducts();
            loadSuppliers();
            loadTransactions();
            populateSupplierDropdowns();
            populateProductDropdowns();
            updateReports();
        });

        // Export functionality (bonus feature)
        function exportToCSV(data, filename) {
            const csvContent = "data:text/csv;charset=utf-8," + 
                data.map(row => row.join(",")).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function exportProducts() {
            const headers = ["SKU", "Name", "Category", "Quantity", "Price", "Min Stock", "Supplier"];
            const data = [headers];
            
            products.forEach(product => {
                const supplier = suppliers.find(s => s.id === product.supplierId);
                data.push([
                    product.sku,
                    product.name,
                    product.category,
                    product.quantity,
                    product.price,
                    product.minStock,
                    supplier ? supplier.company : 'Unknown'
                ]);
            });
            
            exportToCSV(data, "products_export.csv");
        }

        function exportTransactions() {
            const headers = ["Transaction ID", "Product", "Type", "Quantity", "Previous Stock", "New Stock", "Date", "Notes"];
            const data = [headers];
            
            transactions.forEach(transaction => {
                const product = products.find(p => p.id === transaction.productId);
                data.push([
                    `TXN${transaction.id.toString().padStart(4, '0')}`,
                    product ? product.name : 'Unknown Product',
                    transaction.type,
                    transaction.quantity,
                    transaction.previousStock,
                    transaction.newStock,
                    transaction.date,
                    transaction.notes || ''
                ]);
            });
            
            exportToCSV(data, "transactions_export.csv");
        }

        // Add export buttons to the interface
        function addExportButtons() {
            // Add export button to products section
            const productsHeader = document.querySelector('#products .card-header');
            const exportProductsBtn = document.createElement('button');
            exportProductsBtn.className = 'btn btn-success me-2';
            exportProductsBtn.innerHTML = '<i class="fas fa-download me-2"></i>Export CSV';
            exportProductsBtn.onclick = exportProducts;
            productsHeader.appendChild(exportProductsBtn);

            // Add export button to transactions section
            const transactionsHeader = document.querySelector('#transactions .card-header');
            const exportTransactionsBtn = document.createElement('button');
            exportTransactionsBtn.className = 'btn btn-success me-2';
            exportTransactionsBtn.innerHTML = '<i class="fas fa-download me-2"></i>Export CSV';
            exportTransactionsBtn.onclick = exportTransactions;
            transactionsHeader.appendChild(exportTransactionsBtn);
        }

        // Initialize export buttons after DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(addExportButtons, 100); // Small delay to ensure DOM is ready
        });

        // Print report functionality
        function printReport() {
            const reportContent = document.getElementById('reports').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Inventory Report</title>
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
                    <style>
                        body { padding: 20px; }
                        .card { margin-bottom: 20px; }
                        canvas { max-width: 100%; }
                        @media print {
                            .btn { display: none; }
                            canvas { max-width: 400px; max-height: 300px; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Inventory Management Report</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    ${reportContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + N for new product
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (document.getElementById('products').style.display !== 'none') {
                    const modal = new bootstrap.Modal(document.getElementById('productModal'));
                    modal.show();
                }
            }
            
            // Escape key to close modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    const modal = bootstrap.Modal.getInstance(openModal);
                    modal.hide();
                }
            }
        });

        // Auto-save to local storage (optional - commented out due to restrictions)
        /*
        function saveToLocalStorage() {
            localStorage.setItem('inventory_products', JSON.stringify(products));
            localStorage.setItem('inventory_suppliers', JSON.stringify(suppliers));
            localStorage.setItem('inventory_transactions', JSON.stringify(transactions));
        }

        function loadFromLocalStorage() {
            const savedProducts = localStorage.getItem('inventory_products');
            const savedSuppliers = localStorage.getItem('inventory_suppliers');
            const savedTransactions = localStorage.getItem('inventory_transactions');
            
            if (savedProducts) products = JSON.parse(savedProducts);
            if (savedSuppliers) suppliers = JSON.parse(savedSuppliers);
            if (savedTransactions) transactions = JSON.parse(savedTransactions);
        }
        */

        // Search functionality with debouncing
        let searchTimeout;
        function debounceSearch(func, delay) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(func, delay);
        }

        // Enhanced search for products
        document.getElementById('productSearch').addEventListener('input', function() {
            debounceSearch(filterProducts, 300);
        });

        // Theme switching (bonus feature)
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }

        // Initialize theme from localStorage
        /*
        document.addEventListener('DOMContentLoaded', function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
            }
        });
        */

        // Real-time stock updates simulation
        function simulateRealTimeUpdates() {
            setInterval(() => {
                // Simulate random stock changes for demo purposes
                if (Math.random() < 0.1) { // 10% chance every 30 seconds
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                    if (randomProduct.quantity + change >= 0) {
                        const oldQuantity = randomProduct.quantity;
                        randomProduct.quantity += change;
                        
                        // Add transaction record
                        const newTransaction = {
                            id: Math.max(...transactions.map(t => t.id), 0) + 1,
                            productId: randomProduct.id,
                            type: change > 0 ? 'stock-in' : 'stock-out',
                            quantity: Math.abs(change),
                            previousStock: oldQuantity,
                            newStock: randomProduct.quantity,
                            date: new Date().toISOString().split('T')[0],
                            notes: 'Automated system update'
                        };
                        transactions.push(newTransaction);
                        
                        // Update displays if visible
                        if (document.getElementById('products').style.display !== 'none') {
                            loadProducts();
                        }
                        updateDashboard();
                    }
                }
            }, 30000); // Every 30 seconds
        }

        // Start real-time simulation
        // simulateRealTimeUpdates(); // Uncomment to enable real-time simulation

        console.log('Inventory Management System loaded successfully!');
        console.log('Features included:');
        console.log('- Product Management (CRUD operations)');
        console.log('- Supplier Management');
        console.log('- Transaction Tracking');
        console.log('- Barcode Scanner Simulation');
        console.log('- Real-time Dashboard');
        console.log('- Reports & Analytics');
        console.log('- Responsive Design');
        console.log('- Data Export (CSV)');
        console.log('- Search & Filtering');
        console.log('- Low Stock Alerts');