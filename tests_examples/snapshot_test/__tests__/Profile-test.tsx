import React from 'react'
import { render } from '@testing-library/react-native'
import Profile from '../ExampleSnapshot'

describe('Profile snapshots', () => {
    
    it('renders correctly', () => {
        const { toJSON } = render(<Profile name="Adrien Deschenaux" activity="EPFL Student" />);
        expect(toJSON()).toMatchSnapshot();
    });

    it('renders correctly', () => {
        const { toJSON } = render(<Profile name="Voltaire" activity="Philosopher" />);
        expect(toJSON()).toMatchSnapshot();
    });

    it('renders correctly', () => {
        const { toJSON } = render(<Profile name="Claude Debussy" activity="Composer" />);
        expect(toJSON()).toMatchSnapshot();
    });
});