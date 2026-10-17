const React = require('react');

const mockComponent = (name) => {
  const Component = (props) => React.createElement(name, props, props.children);
  Component.displayName = name;
  return Component;
};

module.exports = {
  View: mockComponent('View'),
  Text: mockComponent('Text'),
  TouchableOpacity: mockComponent('TouchableOpacity'),
  TextInput: mockComponent('TextInput'),
  ScrollView: mockComponent('ScrollView'),
  SafeAreaView: mockComponent('SafeAreaView'),
  Modal: mockComponent('Modal'),
  ActivityIndicator: mockComponent('ActivityIndicator'),
  FlatList: (props) => {
    const items = props.data || [];
    return React.createElement(
      'View',
      null,
      items.length === 0 && props.ListEmptyComponent
        ? React.isValidElement(props.ListEmptyComponent)
          ? props.ListEmptyComponent
          : React.createElement(props.ListEmptyComponent)
        : items.map((item, index) => props.renderItem({ item, index }))
    );
  },
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => (Array.isArray(styles) ? Object.assign({}, ...styles) : styles)
  },
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default
  },
  Alert: {
    alert: jest.fn()
  }
};
