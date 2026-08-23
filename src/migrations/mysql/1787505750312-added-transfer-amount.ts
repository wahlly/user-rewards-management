import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTransferAmount1787505750312 implements MigrationInterface {
    name = 'AddedTransferAmount1787505750312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transfers\` ADD \`amount\` decimal(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transfers\` DROP COLUMN \`amount\``);
    }

}
