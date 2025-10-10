import { Button } from './src/components/Button';

export const App = () => {
  return (
    <div>
      <Button
        text='Click me'
        onClick={() => console.log('clicked')}
        className='primary'>
        <span>Extra content</span>
      </Button>

      <Button text='Disabled button' disabled={true} className='secondary' />
    </div>
  );
};
