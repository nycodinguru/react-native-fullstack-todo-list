import React, { useEffect, useReducer } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TextInput,
    Alert,
    StatusBar,
    TouchableOpacity,
    AsyncStorage,
    ActionSheetIOS
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';

const reducer = (state, action) => {
    switch (action.type) {
        case 'text':
            return {
                ...state,
                text: action.text
            };
        case 'todo':
            return {
                ...state,
                todos: [...state.todos,
                {
                    id: action.id,
                    text: action.text,
                    completed: false,
                    createDate: new Date().toDateString(),
                    completedDate: null,
                    updateDate: null
                }
                ]
            };
        case 'current_todo_edit':
            return {
                ...state,
                currentTodoEdit: action.todo
            };
        case 'todo_update':
            return {
                ...state,
                todos: action._todos
            };
        case 'toggle_modal':
            return {
                ...state,
                newTodoModalOpen: action.isOpen
            };
        case 'toggle_edit':
            return {
                ...state,
                editMode: action.isEnabled
            };
        case 'loading':
            return {
                ...state,
                isLoading: action.isLoading
            };
        default:
            break;
    }
    return state;
};

const initialState = {
    text: '',
    todos: [],
    newTodoModalOpen: false,
    editMode: false,
    isLoading: false
};

export default function TodoList(props) {
    const [state, dispatch] = useReducer(reducer, { ...initialState, user: props.navigation.getParam('user', null) });

    const loadTodos = async () => {
        try {
            const allTodos = await AsyncStorage.getItem('allTodos');
            dispatch({ type: 'loading', isLoading: true })
            if (allTodos) {
                dispatch({ type: 'loading', isLoading: false })
                dispatch({ type: 'todo_update', _todos: JSON.parse(allTodos) })
            } else dispatch({ type: 'loading', isLoading: false })
        } catch (error) {
            console.log('There was an error loading todos: ' + error)
        }
    }

    const saveTodos = async () => {
        try {
            await AsyncStorage.setItem('allTodos', JSON.stringify(state.todos));
        } catch (error) {
            console.log('There was an error saving todos: ' + error)
        }
    }

    useEffect(() => {
        loadTodos()
        return () => {
            loadTodos()
        };
    }, [])


    const textInputHandler = (text) => {
        dispatch({ type: 'text', text: text })
    }

    function addOrEditTodo() {
        if (/^\S/i.test(state.text)) {
            if (state.editMode) {
                state.currentTodoEdit.text = state.text
                updateTodo(state.currentTodoEdit.id, 'n', state.text)
            } else {
                let idArr = state.todos.length > 0 ? state.todos.map(i => parseInt(i.id)) : [-1];

                dispatch({ type: 'todo', text: state.text, id: (Math.max(...idArr) + 1).toString() })
            }
            setTimeout(() => {
                dispatch({ type: 'text', text: '' })
                dispatch({ type: 'toggle_modal', isOpen: false })
            }, 100)
        }
        setTimeout(() => {
            saveTodos()
        }, 800)
    }

    function completedPrompt(id) {
        Alert.alert(
            'Todo Completed?',
            '',
            [
                { text: 'No', onPress: () => updateTodo(id) },
                { text: 'Yes', onPress: () => updateTodo(id, 'y') }
            ],
            { cancelable: false },
        )
    }

    function removeItemPrompt(id) {
        Alert.alert(
            'Remove Todo',
            'Are you sure you want to remove this todo?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => removeItem(id) }
            ],
            { cancelable: false },
        )
    }

    function updateTodo(id, s, textArg) {
        let status = s === 'y' ? true : false;
        let text = textArg ? textArg : null;
        let _todos = state.todos;
        _todos.filter(i => {
            if (i.id === id && !text) {
                _todos[_todos.indexOf(i)].completed = status
                _todos[_todos.indexOf(i)].completedDate = status ? new Date().toDateString() : null
                dispatch({ type: 'todo_update', _todos: _todos })
            }
            else if (i.id === id && text) {
                _todos[_todos.indexOf(i)].text = text
                _todos[_todos.indexOf(i)].updateDate = new Date().toDateString()
                dispatch({ type: 'todo_update', _todos: _todos })
            }
        }
        )
        saveTodos()
    }

    function removeItem(id) {
        let _todos = state.todos;
        _todos.filter(i => {
            if (i.id === id) {
                _todos.splice(_todos.indexOf(i), 1)
                dispatch({ type: 'todo_update', _todos: _todos })
            }
        }
        )
    }

    function updateTodoText(id) {
        let _todos = state.todos;
        _todos.filter(i => {
            if (i.id === id) {
                dispatch({ type: 'text', text: state.todos[_todos.indexOf(i)].text })
                dispatch({ type: 'current_todo_edit', todo: state.todos[_todos.indexOf(i)] })
            }
        })
        toggleNewTodoModal()
    }

    function toggleNewTodoModal() {
        let isOpen = state.newTodoModalOpen ? false : true;
        dispatch({ type: 'toggle_modal', isOpen: isOpen })
    }

    function toggleEditMode() {
        let isEnabled = state.editMode ? false : true;
        dispatch({ type: 'toggle_edit', isEnabled: isEnabled })
    }

    function actionSheet() {
        saveTodos()
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: ['Cancel', 'Toggle Edit Mode', props.navigation.getParam('user') ? 'Sign Out' : 'Sign In'],
                cancelButtonIndex: 0
            },
            (buttonIndex) => {
                if (buttonIndex === 1) {
                    toggleEditMode()
                }
                if (buttonIndex === 2) {
                    props.navigation.navigate('LoginScreen')
                }
            },
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.headerContainer, styles.shadow]}>
                <LinearGradient
                    colors={['rgb(89, 74, 225)', 'rgb(131, 52, 210)']}
                    start={[0.6, 0]}
                    style={{ height: '100%', paddingTop: 30 }}
                >
                    <StatusBar
                        translucent
                        barStyle='light-content'
                    ></StatusBar>
                    <Text
                        accessibilityRole='header'
                        style={styles.header}
                    >
                        <Ionicons name='ios-checkmark-circle' size={36} color="#fff" /> Todo List
          </Text>
                    <TouchableOpacity style={styles.menuButton} onPress={actionSheet}>
                        <MaterialCommunityIcons name='dots-horizontal' size={27} color='rgba(255, 255, 255, 1)' style={{ top: 1 }} />
                    </TouchableOpacity>

                </LinearGradient>
            </View>
            <View style={styles.listContainer}>
                {
                    state.todos.length < 1 && <Text style={styles.noTodos}>No Todos</Text>
                }
                <FlatList
                    data={state.todos}
                    renderItem={itemData => (
                        <View key={itemData.item.id} style={[styles.listItemContainer, styles.shadow, itemData.item === state.todos[state.todos.length - 1] && { marginBottom: 50 }, itemData.item === state.todos[0] && { marginTop: 35 }, state.editMode && styles.editModeActive && { width: '75%', left: -60 }]}>
                            <Text style={[{ left: 20, top: '45%', zIndex: 100, position: 'absolute' }, state.editMode && { display: 'none' }]} onPress={() => completedPrompt(itemData.item.id)}>
                                {
                                    itemData.item.completed ? <Ionicons name='ios-checkmark-circle' size={34} color='#53d769' /> : <FontAwesome name='circle-thin' size={32} color="rgba(0, 0, 0, 0.7)" />
                                }
                            </Text>
                            <Text
                                style={[styles.listItem, itemData.item.completed && { opacity: 0.25 }, state.editMode && styles.editModeActive]}>
                                {itemData.item.text}
                            </Text>
                            <Text style={[{ color: 'rgba(0, 0, 0, 0.4)', fontSize: 10, fontWeight: '600', textAlign: 'right' }, state.editMode && styles.editModeActive]}>
                                {itemData.item.completedDate && `Completed on ${itemData.item.completedDate}`}
                                {!itemData.item.completedDate && itemData.item.updateDate && `Edited on ${itemData.item.updateDate}`}
                                {!itemData.item.completedDate && !itemData.item.updateDate && `Created on ${itemData.item.createDate}`}
                            </Text>
                            {
                                state.editMode && <View style={{ position: 'absolute', top: 60, right: 155 }}>
                                    {!itemData.item.completed && <Text style={[styles.updateButton, styles.updateRemoveButton]} onPress={() => updateTodoText(itemData.item.id)}>UPDATE</Text>}
                                    <Text style={[styles.removeButton, styles.updateRemoveButton]} onPress={() => removeItemPrompt(itemData.item.id)}>REMOVE</Text>
                                </View>
                            }
                        </View>
                    )}
                    keyExtractor={item => item.id}
                />
            </View>
            {
                state.newTodoModalOpen && <View style={[styles.inputContainer]}>
                    <TouchableOpacity style={styles.shadow} onPress={toggleNewTodoModal}>
                        <Text style={styles.closeButton}>×</Text>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="New Todo"
                        style={styles.input}
                        onChangeText={textInputHandler}
                        value={state.text}
                        multiline={true}
                        autoFocus={true}
                    />
                    <TouchableOpacity onPress={addOrEditTodo}>
                        <Text style={styles.submitButton}> {state.editMode ? 'Update' : 'Add'} </Text>
                    </TouchableOpacity>
                </View>
            }
            {
                state.editMode || !state.newTodoModalOpen && <TouchableOpacity style={[styles.shadow, styles.newTodoButton]} onPress={toggleNewTodoModal}>
                    <LinearGradient
                        colors={['rgb(89, 74, 225)', 'rgb(131, 52, 210)']}
                        start={[0.6, 0]}
                        style={{ height: '100%', borderRadius: 28, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Octicons name='plus' size={30} style={{ top: 1 }} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 30
    },
    headerContainer: {
        width: '120%',
        position: 'absolute',
        paddingLeft: 0,
        paddingRight: 0,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        zIndex: 100
    },
    header: {
        color: '#fff',
        textAlign: 'left',
        fontSize: 35,
        marginTop: 40,
        marginLeft: 20,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },
    menuButton: {
        width: 30,
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        borderRadius: 30,
        overflow: 'hidden',
        top: -7,
        right: '-88%'
    },
    updateRemoveButton: {
        textAlign: 'center',
        position: 'relative',
        right: -230,
        width: 80,
        fontSize: 12,
        fontWeight: '700'
    },
    updateButton: {
        backgroundColor: 'rgb(89, 74, 225)',
        borderRadius: 14,
        overflow: 'hidden',
        color: '#fff',
        padding: 7,
        marginTop: -25.5,
        transform: [{ translateX: 18 }, { translateY: -16 }]
    },
    removeButton: {
        textAlign: 'center',
        position: 'relative',
        right: -230,
        color: 'red',
        width: 80,
        padding: 10,
        marginTop: -25.5,
        transform: [{ translateX: 18 }, { translateY: 10 }]
    },
    newTodoButton: {
        position: 'absolute',
        bottom: 40,
        right: 25,
        width: 55,
        height: 55,
        borderRadius: 28
    },
    inputContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignSelf: 'center',
        top: 130,
        zIndex: 1000,
        height: '40%',
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.7,
        shadowRadius: 60,
    },
    closeButton: {
        position: 'absolute',
        fontSize: 22,
        fontWeight: '600',
        color: 'rgb(89, 74, 225)',
        backgroundColor: '#fff',
        borderRadius: 15,
        textAlign: 'center',
        right: -165,
        top: -14,
        height: 30,
        width: 30,
        padding: 1,
        overflow: 'hidden',
        lineHeight: 25.5,
        letterSpacing: -1,
        zIndex: 500
    },
    input: {
        width: '80%',
        padding: 2,
        paddingTop: 15,
        fontSize: 18,
        height: '77%',
        marginTop: 20
    },
    submitButton: {
        color: 'rgb(89, 74, 225)',
        position: 'relative',
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        padding: 5,
        paddingLeft: 12,
        paddingRight: 12,
        overflow: 'hidden',
        borderRadius: 15,
        bottom: 0,
        backgroundColor: 'rgb(89, 74, 225)'
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.17,
        shadowRadius: 3,
        backgroundColor: 'white',
    },
    listContainer: {
        backgroundColor: 'rgb(249, 249, 249)',
        width: '120%',
        alignSelf: 'center',
        paddingBottom: 200,
        marginTop: 100,
        minHeight: '110%'
    },
    noTodos: {
        marginTop: '60%',
        color: 'rgba(0, 0, 0, 0.4)',
        fontSize: 26,
        textAlign: 'center'
    },
    listItem: {
        fontSize: 18,
        textAlign: 'left',
        padding: 15,
        marginLeft: 20,
        fontWeight: '500'
    },
    listItemContainer: {
        width: '90%',
        paddingLeft: 30,
        padding: 10,
        paddingRight: 30,
        margin: 10,
        borderRadius: 10,
        alignSelf: 'center',
    },
    editModeActive: {
        transform: [{ translateX: -40 }]
    }
});



