class Logging {
    public static enabled: boolean = false;

    public static Log(message: any): void {
        if (this.enabled) console.log(message);
    }
}

export { Logging }