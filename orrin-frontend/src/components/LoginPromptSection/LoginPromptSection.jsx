import SectionHeader from '../SectionHeader/SectionHeader.jsx'; // Використовуємо наш універсальний заголовок
import './LoginPromptSection.css';

export default function LoginPromptSection(
    {
        title,
        promptText,
        buttonText,
        onLoginClick,
        onMoreClick
    }) {
    return (<section>
        <SectionHeader title={title} onMoreClick={onMoreClick}/>
        <div className="login-prompt-container">
            <p className="login-prompt-text">{promptText}</p>
            <button className="login-prompt-button" onClick={onLoginClick}>
                {buttonText}
            </button>
        </div>
    </section>);
}