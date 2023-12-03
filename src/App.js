import axios from 'axios';
import './App.css';
import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import DoneOutlineOutlinedIcon from '@mui/icons-material/DoneOutlineOutlined';

const App = () => {
  const [loading, setLoading] = useState(true);
  const [displayedData, setDisplayedData] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
        if (response.status !== 200) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        setData(response.data);
        setDisplayedData(response.data);
      } catch (error) {
        console.error('Axios error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const [currentPage, setCurrentpage] = useState(1);
  const [selectRecords, setSelectedRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const recordsPerPage = 10;
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const records = displayedData ? displayedData.slice(firstIndex, lastIndex) : [];
  const npage = displayedData && Math.ceil(displayedData.length / recordsPerPage);
  const numbers = [...Array(npage + 1).keys()].slice(1);

  const [editingRecord, setEditingRecord] = useState(1);
  const [updatedData, setUpdatedData] = useState({ name: '', email: '', role: '' });

  const handleSearch = (query) => {
    setSearchQuery(query);
    const fitleredData = data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.email.toLowerCase().includes(query.toLowerCase()) ||
      item.role.toLowerCase().includes(query.toLowerCase())
    )
    setDisplayedData(fitleredData);
  }

  const editRecord = (id, currentData) => {
    setEditingRecord(id);
    setUpdatedData({ ...currentData });
  }

  const handleInputChange = (field, value) => {
    setUpdatedData((prevData) => ({ ...prevData, [field]: value }));
  }

  const deleteRecord = (id) => {
    const updatedData = displayedData.filter((item) => item.id !== id);
    setDisplayedData([...updatedData]);
    const updatedData2 = data.filter((item) => item.id !== id);
    setData(updatedData2);
  }

  const cancelEdit = () => {
    setEditingRecord(null);
    setUpdatedData({ name: '', email: '', role: '' });
  }

  const toggleSelectRecord = (id) => {
    if (selectRecords.includes(id)) {
      setSelectedRecords((prevSelected) => prevSelected.filter((recordId) => recordId !== id));
    } else {
      setSelectedRecords((prevSelected) => [...prevSelected, id]);
    }
  }

  const toggleSelectAllOnPage = () => {
    if (selectAllOnPage) {
      setSelectedRecords([]);
    } else {
      const pageRecordIds = records.map((item) => item.id);
      setSelectedRecords(pageRecordIds);
    }
    setSelectAllOnPage((prev) => !prev);
  };

  const saveChanges = (id) => {
    const dataIndex = displayedData.findIndex((item) => item.id === id);
    if (dataIndex !== -1) {
      displayedData[dataIndex] = { ...displayedData[dataIndex], ...updatedData };
      console.log("yaha tak work kar raha hai")
      data[dataIndex] = { ...data[dataIndex], ...updatedData };
    }
    else {
      console.log('error');
    }
    setEditingRecord(null);
    setUpdatedData({ name: '', email: '', role: '' });
  }

  const prePage = () => {
    if (currentPage !== 1) {
      setCurrentpage(currentPage - 1)
    }
  }

  const changePage = (id) => {
    setCurrentpage(id)
  }

  const nextPage = () => {
    if (currentPage !== npage) {
      setCurrentpage(currentPage + 1)
    }
  }

  const deleteSelectedRecords = () => {
    const updatedData = displayedData.filter((item) => !selectRecords.includes(item.id));
    setDisplayedData(updatedData);
    const updatedData2 = data.filter((item) => !selectRecords.includes(item.id));
    setData(updatedData2);
    setSelectedRecords([]);
    setSelectAllOnPage(false);

  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section className='p-4 '>
      {console.log(displayedData)}
      {console.log(data)}
      <div className='alignment'>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <DeleteIcon className='m-1 mb-1' onClick={deleteSelectedRecords} title="Delete all selected items" />
      </div>
      <table className='table table-bordered table-striped text-center mb-4'>
        <thead className='table-primary'>
          <th><input
            type='checkbox'
            onChange={toggleSelectAllOnPage}
            checked={selectAllOnPage}
          /></th>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Action</th>
        </thead>
        <tbody > {displayedData ?
          records.map((item, id) => (
            <tr key={id}>
              <td>
                <input
                  type='checkbox'
                  checked={selectRecords.includes(item.id)}
                  onChange={() => toggleSelectRecord(item.id)}
                />
              </td>
              <td>{editingRecord === item.id ? <input type="text" value={updatedData.name} onChange={(e) => handleInputChange('name', e.target.value)} /> : item.name}</td>
              <td>{editingRecord === item.id ? <input type="text" value={updatedData.email} onChange={(e) => handleInputChange('email', e.target.value)} /> : item.email}</td>
              <td>{editingRecord === item.id ? <input type="text" value={updatedData.role} onChange={(e) => handleInputChange('role', e.target.value)} /> : item.role}</td>
              <td>
                {editingRecord === item.id ? (
                  <>
                    <DoneOutlineOutlinedIcon onClick={() => saveChanges(item.id)} />
                    <CancelOutlinedIcon onClick={cancelEdit} />
                  </>
                ) : (
                  <div className=''>
                    <EditIcon onClick={() => editRecord(item.id, { name: item.name, email: item.email, role: item.role })} />
                    <DeleteOutlineIcon onClick={() => deleteRecord(item.id)} />
                  </div>
                )}
              </td>
            </tr>
          ))
          : <>No Records </>}</tbody>
      </table>
      <nav>
        <ul className='pagination'>
          <li className='page-item'>
            <a href='#' className='page-link' onClick={() => setCurrentpage(1)}>First Page</a>
          </li>
          <li className='page-item'>
            <a href='#' className='page-link' onClick={prePage}>Prev</a>
          </li>
          {
            numbers.map((n, i) => (
              <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={i}>
                <a href='#' className='page-link' onClick={() => changePage(n)}>{n}</a>
              </li>
            ))
          }
          <li className='page-item'>
            <a href='#' className='page-link' onClick={nextPage}>Next</a>
          </li>
          <li className='page-item'>
            <a href='#' className='page-link' onClick={() => setCurrentpage(npage)}>Last Page</a>
          </li>
        </ul>
      </nav>
    </section>
  )
}

export default App