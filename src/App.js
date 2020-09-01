import React from 'react';
import './App.css';

class App extends React.Component {
  baseUrl = 'https://todolist-djangoapi.herokuapp.com'

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      activeItem: this.defaultActiveItem(),
      editing: false,
    };
    this.fetchTasks = this.fetchTasks.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCookie = this.getCookie.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.strikeUnstrike = this.strikeUnstrike.bind(this);
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Does this cookie string begin with the name we want?
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  componentWillMount() {
    this.fetchTasks();
  }

  fetchTasks() {
    fetch(`${this.baseUrl}/tasks/`)
      .then((response) => response.json())
      .then((data) =>
        this.setState({
          tasks: data,
        }),
      );
  }

  defaultActiveItem() {
    return {
      id: null,
      title: '',
      completed: false,
    };
  }

  handleChange(e) {
    const name = e.target.name;
    const value = e.target.value;

    this.setState({
      activeItem: {
        ...this.state.activeItem,
        title: value,
      },
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const csrftoken = this.getCookie('csrftoken');

    var url = `${this.baseUrl}/tasks/`;
    var method = 'POST';

    if (this.state.editing) {
      const { id } = this.state.activeItem
      url = `${url}${id}/`;
      method = 'PUT';
      this.setState({
        editing: false,
      });
    }

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      mode: 'cors',
      body: JSON.stringify(this.state.activeItem),
    })
      .then((response) => {
        this.fetchTasks();
        this.setState({ activeItem: this.defaultActiveItem() });
      })
      .catch((error) => {
        console.log('Error: ' + error);
      });
  }

  startEdit(task) {
    this.setState({
      activeItem: task,
      editing: true,
    });
  }

  deleteItem(task) {
    const csrftoken = this.getCookie('csrftoken');
    const url = `${this.baseUrl}/tasks/${task.id}/`;

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
    }).then((response) => {
      this.fetchTasks();
    });
  }

  strikeUnstrike(task) {
    task.completed = !task.completed;

    if (!task.completed) {
      task.completed_date = null
    }

    const csrftoken = this.getCookie('csrftoken');
    const url = `${this.baseUrl}/tasks/${task.id}/`;

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken,
      },
      body: JSON.stringify(task),
    }).then(() => {
      this.fetchTasks();
    });
  }

  render() {
    const { tasks } = this.state;
    const self = this;

    return (
      <div className="container">
        <div id="task-container">
          <div id="form-wrapper">
            <form id="form" onSubmit={this.handleSubmit}>
              <div className="flex-wrapper">
                <div style={{ flex: 6 }}>
                  <input
                    className="form-control"
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Add your task"
                    onChange={this.handleChange}
                    value={this.state.activeItem.title}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    id="submit"
                    className="btn btn-info"
                    type="submit"
                    value="Submit"
                  />
                </div>
              </div>
            </form>
          </div>
          <div id="list-wrapper">
            {tasks.map((task, index) => {
              return (
                <div key={index} className="task-wrapper flex-wrapper">
                  <div
                    onClick={() => self.strikeUnstrike(task)}
                    style={{ flex: 7 }}>
                    {task.completed ? (
                      <div>
                        <s>{task.title}</s>
                        <div className="task-detail">
                          <span>Created : {task.create_date}</span> <br/>
                          <span>Completed : {task.completed_date}</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <span>{task.title}</span>
                        <div className="task-detail">
                          <span>Created : {task.create_date}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.startEdit(task)}
                      className="btn btn-sm btn-outline-info">
                      Edit
                    </button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => self.deleteItem(task)}
                      className="btn btn-sm btn-outline-danger delete">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
