import { useState, useEffect } from 'react';
import { Plus, Search, Truck, Settings, Trash2 } from 'lucide-react';
import styles from './VehicleList.module.css';
import VehicleForm from './VehicleForm';

import axios from 'axios';

// Mock Data removed

const VehicleList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get('/vehicles');
            setVehicles(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vehicles', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowForm(true);
    };

    const handleClose = () => {
        setShowForm(false);
        setSelectedVehicle(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
            try {
                await axios.delete(`/vehicles/${id}`);
                setVehicles(vehicles.filter(v => v._id !== id));
                fetchVehicles(); // Refresh to be safe
            } catch (error) {
                console.error('Error deleting vehicle', error);
                alert('Erreur lors de la suppression');
            }
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        (filter === 'all' || v.status === filter) &&
        (v.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available': return <span className={`${styles.badge} ${styles.success}`}>Disponible</span>;
            case 'in-use': return <span className={`${styles.badge} ${styles.warning}`}>En Mission</span>;
            case 'maintenance': return <span className={`${styles.badge} ${styles.error}`}>Maintenance</span>;
            default: return null;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.filters}>
                    <div className={styles.search}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Rechercher (Marque, Matricule)..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select className={styles.filterSelect} value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">Tous les statuts</option>
                        <option value="available">Disponible</option>
                        <option value="in-use">En Mission</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                <button className={styles.addButton} onClick={() => { setSelectedVehicle(null); setShowForm(true); }}>
                    <Plus size={20} />
                    <span>Nouveau Véhicule</span>
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingGrid}>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={styles.loadingCard}></div>
                    ))}
                </div>
            ) : filteredVehicles.length === 0 ? (
                <div className={styles.emptyState}>
                    <Truck size={48} />
                    <h3>Aucun véhicule trouvé</h3>
                    <p>Aucun véhicule ne correspond à votre recherche</p>
                    <button 
                        className={styles.addButton}
                        onClick={() => { setSelectedVehicle(null); setShowForm(true); }}
                    >
                        <Plus size={20} />
                        <span>Ajouter un véhicule</span>
                    </button>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredVehicles.map(vehicle => (
                        <div key={vehicle.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    <Truck size={24} />
                                </div>
                                <div className={styles.actionButtons}>
                                    <button className={styles.actionBtn} onClick={() => handleEdit(vehicle)}>
                                        <Settings size={18} />
                                    </button>
                                    <button 
                                        className={styles.actionDeleteBtn} 
                                        onClick={() => handleDelete(vehicle.id || vehicle._id)}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.cardBody}>
                                <h3 className={styles.brand}>{vehicle.brand} {vehicle.model}</h3>
                                <p className={styles.matricule}>{vehicle.matricule}</p>
                                
                                <div className={styles.detailsGrid}>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Direction</span>
                                        <span className={styles.detailValue}>{vehicle.direction}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Places restantes</span>
                                        <span className={styles.detailValue}>{vehicle.nbPlaceReste}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Capacité</span>
                                        <span className={styles.detailValue}>{vehicle.capacite}</span>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <span className={styles.detailLabel}>Type</span>
                                        <span className={styles.detailValue}>{vehicle.type}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardFooter}>
                                {getStatusBadge(vehicle.status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <VehicleForm
                    onClose={handleClose}
                    onSuccess={fetchVehicles}
                    vehicle={selectedVehicle}
                />
            )}
        </div>
    );
};
export default VehicleList;