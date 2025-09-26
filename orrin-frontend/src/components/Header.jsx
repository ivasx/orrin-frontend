import logo from "/orrin-logo.svg"

export default function Header() {
    return (
        <header>
            <img src={logo} className="logo" alt="logo" />
            {/* <h3>Orrin</h3> */}

            <span>Тут щось буде</span>
        </header>
    )
}