class Logging {
    public static enabled: boolean = false;

    public static log(message: any): void {
        if (this.enabled) console.log(message);
    }
}

export { Logging }